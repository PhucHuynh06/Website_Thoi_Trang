import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add_product_icon from '../../assets/Product_Cart.svg'
import list_product_icon from '../../assets/Product_list_icon.svg'
import { BiCategoryAlt } from "react-icons/bi";

const Slidebar = () => {
  return (
    <div className='sidebar'>
        <Link to={'/addproduct'} style={{textDecoration:"none"}}>
            <div className="sidebar-item">
                <img src={add_product_icon} alt="" />
                <p>Thêm sản phẩm</p>
            </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration:"none"}}>
            <div className="sidebar-item">
                <img src={list_product_icon} alt="" />
                <p>Danh Sách Sản Phẩm</p>
            </div>
        </Link>
        <Link to={'/category'} style={{textDecoration:"none"}}>
            <div className="sidebar-item">
            <BiCategoryAlt size={40}/>
            <p>Danh Sách Thể Loại</p>
            </div>
        </Link>

        
    </div>
  )
}

export default Slidebar