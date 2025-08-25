'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import { Box, Modal, Typography, Stack, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [editExpense, setEditExpense] = useState(null);


  const updateExpenses = async () => {
    try {
      const expensesCollection = collection(firestore, 'expenses');
      const docs = await getDocs(expensesCollection);
      const expensesList = [];
      docs.forEach((doc) => {
        expensesList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setExpenses(expensesList);
      console.log('Expenses loaded:', expensesList.length, 'items');
    } catch (error) {
      console.error('Error updating expenses:', error);
      alert('Error loading expenses. Please check the console for details.');
    }
  };

  const addExpense = async (expense) => {
    try {
      console.log('Starting addExpense function...');
      console.log('Firestore instance:', firestore);
      console.log('Adding expense:', expense, 'with data:', { category, amount, paymentMethod });
      
      // Test basic Firestore connection first
      console.log('Testing Firestore connection...');
      const testCollection = collection(firestore, 'test');
      console.log('Test collection created successfully');
      
      const docRef = doc(collection(firestore, 'expenses'), expense);
      console.log('Document reference created:', docRef);
      
      const docSnap = await getDoc(docRef);
      console.log('Document snapshot retrieved, exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        console.log('Updating existing expense, current quantity:', quantity);
        await setDoc(docRef, { quantity: (quantity || 0) + 1, category, amount, paymentMethod }, { merge: true });
        console.log('Updated existing expense quantity');
      } else {
        console.log('Creating new expense...');
        await setDoc(docRef, { quantity: 1, category, amount, paymentMethod });
        console.log('Created new expense');
      }
      
      console.log('Calling updateExpenses...');
      await updateExpenses();
      console.log('Expenses updated successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name
      });
      
      // More specific error messages
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your Firestore security rules.');
      } else if (error.code === 'unavailable') {
        alert('Firebase is unavailable. Please check your internet connection.');
      } else {
        alert(`Error adding expense: ${error.message}. Please check the console for details.`);
      }
    }
  };

  const removeExpense = async (expense) => {
    try {
      const docRef = doc(collection(firestore, 'expenses'), expense);
      await deleteDoc(docRef);
      await updateExpenses();
      console.log('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense. Please try again.');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditExpense(null);
    // Reset form fields when closing
    setExpenseName('');
    setCategory('');
    setAmount('');
    setPaymentMethod('');
  };

  const handleEdit = (expenseName) => {
    const expense = expenses.find((i) => i.name === expenseName);
    if (expense) {
      setEditExpense(expenseName);
      setCategory(expense.category || '');
      setAmount(expense.amount || '');
      setPaymentMethod(expense.paymentMethod || '');
      handleOpen();
    }
  };

  const handleSaveEdit = async () => {
    const docRef = doc(collection(firestore, 'expenses'), editExpense);
    await setDoc(docRef, { category, amount, paymentMethod }, { merge: true });
    setEditExpense(null);
    handleClose();
    await updateExpenses();
  };

  useEffect(() => {
    updateExpenses();
  }, []);



  // Calculate total monthly spending
  const totalMonthlySpending = expenses.reduce((total, expense) => {
    return total + parseFloat(expense.amount || 0);
  }, 0);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="row"
      gap={2}
      sx={{ backgroundColor: "black" }}
    >
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        p={2}
      >

        <Typography variant='h3' color='#77ec6e'>
          Your <em>Ultimate</em> Personal Finance Management Tool
        </Typography>
        <Typography variant="body1" color="white" textAlign="center">
          Our finance tracker revolutionizes personal budgeting with its user-friendly interface.<br></br>Effortlessly track, categorize, monitor, and analyze your monthly expenses.
        </Typography>

        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={300}
            bgcolor="white"
            border="10px solid #033958"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6">{editExpense ? "Edit Expense" : "Add Expense"}</Typography>
            <TextField
              variant='outlined'
              fullWidth
              label="Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              disabled={!!editExpense}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">Select a category</MenuItem>
                <MenuItem value="Food & Dining">Food & Dining</MenuItem>
                <MenuItem value="Transportation">Transportation</MenuItem>
                <MenuItem value="Shopping">Shopping</MenuItem>
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Bills & Utilities">Bills & Utilities</MenuItem>
                <MenuItem value="Healthcare">Healthcare</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Home & Garden">Home & Garden</MenuItem>
                <MenuItem value="Personal Care">Personal Care</MenuItem>
                <MenuItem value="Gifts & Donations">Gifts & Donations</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              variant='outlined'
              fullWidth
              label="Amount ($)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              variant='outlined'
              fullWidth
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <Stack width="100%" direction="row" spacing={2}>
              <Button
                variant='contained'
                onClick={async () => {
                  if (editExpense) {
                    await handleSaveEdit();
                  } else {
                    if (expenseName.trim()) {
                      await addExpense(expenseName.trim());
                    }
                  }
                  handleClose();
                }}
              >
                {editExpense ? "Save" : "Add"}
              </Button>
              <Button
                variant='outlined'
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant='contained'
            onClick={() => {
              setExpenseName('');
              setCategory('');
              setAmount('');
              setPaymentMethod('');
              setEditExpense(null);
              handleOpen();
            }}
            sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#022a46' } }}
          >
            Add New Expense
          </Button>

          <Button
            variant='contained'
            onClick={async () => {
              if (confirm('Are you sure you want to clear all expenses? This cannot be undone.')) {
                try {
                  console.log('Starting to clear all expenses...');
                  const expensesCollection = collection(firestore, 'expenses');
                  console.log('Collection reference created');
                  
                  const querySnapshot = await getDocs(expensesCollection);
                  console.log('Found', querySnapshot.size, 'expenses to delete');
                  
                  if (querySnapshot.size === 0) {
                    alert('No expenses to clear!');
                    return;
                  }
                  
                  const deletePromises = querySnapshot.docs.map(doc => {
                    console.log('Deleting document:', doc.id);
                    return deleteDoc(doc.ref);
                  });
                  
                  await Promise.all(deletePromises);
                  console.log('All documents deleted successfully');
                  
                  await updateExpenses();
                  console.log('Expenses list updated');
                  
                  alert(`Successfully cleared ${querySnapshot.size} expenses!`);
                } catch (error) {
                  console.error('Error clearing expenses:', error);
                  console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                  });
                  
                  if (error.code === 'permission-denied') {
                    alert('Permission denied. Please check your Firestore security rules.');
                  } else {
                    alert(`Error clearing expenses: ${error.message}. Please check the console for details.`);
                  }
                }
              }
            }}
            sx={{ backgroundColor: '#e0297b', '&:hover': { backgroundColor: '#c41e6a' } }}
          >
            Clear All Expenses
          </Button>
        </Box>



        {/* Monthly Total Display */}
        <Box
          border='5px solid #77ec6e'
          sx={{ 
            backgroundColor: 'white', 
            width: '100%', 
            maxWidth: '1000px', 
            mb: 2,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant='h4' color='#033958'>
            Total: ${totalMonthlySpending.toFixed(2)}
          </Typography>
        </Box>

        <Box border='5px solid #033958' sx={{ backgroundColor: 'white', width: '100%', maxWidth: '1000px' }}>
          <Box
            height="70px"
            bgcolor="#77ec6e"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant='h4' color='#033958'>
              Monthly Expenses
            </Typography>
          </Box>
          <Stack height="400px" spacing={1} overflow="auto">
            {
              expenses.map(({ name, quantity, category, amount, paymentMethod }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="125px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgColor="#f0f0f0"
                  padding={4}
                >
                  <Box>
                    <Typography variant="h5" color='#033958' textAlign='center'>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body2" color='black'>
                      Category: {category}
                    </Typography>
                    <Typography variant="body2" color='black'>
                      Amount: ${amount ? Number(amount).toFixed(2) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color='black'>
                      Payment: {paymentMethod}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant='contained'
                      onClick={() => removeExpense(name)}
                      sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#e0297b' } }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant='contained'
                      onClick={() => handleEdit(name)}
                      sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#e0297b' } }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Box>
              ))
            }
          </Stack>
        </Box>
      </Box>


    </Box>
  );
}

