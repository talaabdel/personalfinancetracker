'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '../config/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from 'firebase/firestore';


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  const updateInventory = async () => {
    const inventoryCollection = collection(firestore, 'inventory');
    const docs = await getDocs(inventoryCollection);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };


  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: (quantity || 0) + 1, category, price, supplier }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, category, price, supplier });
    }
    await updateInventory();
  };


  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };


  const handleEdit = (itemName) => {
    const item = inventory.find((i) => i.name === itemName);
    if (item) {
      setEditItem(itemName);
      setCategory(item.category || '');
      setPrice(item.price || '');
      setSupplier(item.supplier || '');
      handleOpen();
    }
  };


  const handleSaveEdit = async () => {
    const docRef = doc(collection(firestore, 'inventory'), editItem);
    await setDoc(docRef, { category, price, supplier }, { merge: true });
    setEditItem(null);
    handleClose();
    await updateInventory();
  };


  useEffect(() => {
    updateInventory();
  }, []);


  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

///////////////////////////////////////////////////////////////////////////

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent={'center'} // horizontally
      alignItems={'center'} // vertically
      gap={1}
      sx={{ backgroundColor: "black" }}
    >
     
      <Typography variant='h3' color='#77ec6e' >
        WELCOME TO INVENTORY TRACKER 3000
      </Typography>
      <Typography variant="body1" color="white" sx={{ marginBottom: 3, textAlign: 'center'  }}>
      Our intuitive pantry tracker app revolutionizes inventory management with its user-friendly interface. <br/> Effortlessly add, edit, remove, categorize, and monitor your pantry items. Stay organized with a sleek, responsive design <br/>that streamlines the tracking and management of your pantry essentials, ensuring efficiency and simplicity at your fingertips.
      </Typography>

      

      //////////////////////////////////////////////////////
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
          <Typography variant="h6">{editItem ? "Edit Item" : "Add Item"}</Typography>
          <TextField
            variant='outlined'
            fullWidth
            label="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={!!editItem} // Disable input if editing
          />
          <TextField
            variant='outlined'
            fullWidth
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <TextField
            variant='outlined'
            fullWidth
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            variant='outlined'
            fullWidth
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
          <Stack width="100%" direction="row" spacing={2}>
            <Button
              variant='contained'
              onClick={() => {
                if (editItem) {
                  handleSaveEdit();
                } else {
                  addItem(itemName);
                }
                handleClose();
              }}
            >
              {editItem ? "Save" : "Add"}
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
      <Button
        variant='contained'
        onClick={() => {
          setItemName('');
          setCategory('');
          setPrice('');
          setSupplier('');
          handleOpen();
        }}
        sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#022a46' } }}
      >
        Add New Item
      </Button>
      <Box
      border = '5px solid #033958'
      sx={{ width: '800px', marginBottom: '10px', backgroundColor: 'white' }}
      >
      <TextField
        variant='outlined'
        placeholder="Search items"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
      />
      </Box>
      <Box border='5px solid #033958' sx={{ backgroundColor: 'white' }}>
        <Box
          width="800px"
          height="70px"
          bgcolor="#77ec6e"
          display="flex"
          alignItems="center"
          justifyContent={'center'}
        >
          <Typography variant='h4' color='#033958'>
          Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={1} overflow="auto">
          {
            filteredInventory.map(({ name, quantity, category, price, supplier }) => (
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
                  <Typography variant="h4" color='#fc3794' textAlign={'center'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body1" color='#fc3794'>
                    Category: {category}
                  </Typography>
                  <Typography variant="body1" color='#fc3794'>
                    Price: ${price ? Number(price).toFixed(2) : 'N/A'}
                  </Typography>
                  <Typography variant="body1" color='#fc3794'>
                    Supplier: {supplier}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Typography variant="h5" color='#fc3794' textAlign={'center'}>
                    Quantity: {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name);
                    }}
                    sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#e0297b' } }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name);
                    }}
                    sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#e0297b' } }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleEdit(name);
                    }}
                    sx={{ backgroundColor: '#fc3794', '&:hover': { backgroundColor: '#e0297b' } }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
}
