import React from 'react'
import'./Admin.css'
import Slidebar from '../../Components/Slidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import Category from '../../Components/Category/Category'




const Admin = () => {
  return (
    <div className='admin'>
        <Slidebar/>
        <Routes>
          <Route path='/addproduct' element={<AddProduct/>}/>
          <Route path='/listproduct' element={<ListProduct/>}/>
          <Route path='/category' element={<Category/>}/>
        </Routes>
        
    </div>
  )
}

export default Admin