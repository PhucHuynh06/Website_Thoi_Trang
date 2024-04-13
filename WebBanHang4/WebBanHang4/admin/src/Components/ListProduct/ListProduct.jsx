import React, { useEffect, useState } from "react";
import cross_icon from "../../assets/cross_icon.png";
import "./ListProduct.css";

const ListProduct = () => {
  const [allproducts, setAllproducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts")
      .then((res) => res.json())
      .then((data) => {
        setAllproducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();
  };

  return (
    <div className="list-product-container">
      <div className="list-product-header">
        <h1>Danh Sách Sản Phẩm</h1>
      </div>
      <div className="list-product-body">
        <div className="list-product-table">
          <div className="list-product-table-header">
            <p className="list-product-table-header-item">Sản Phẩm</p>
            <p className="list-product-table-header-item">Tên</p>
            <p className="list-product-table-header-item">Giá Gốc</p>
            <p className="list-product-table-header-item">Giá Bán</p>
            <p className="list-product-table-header-item">Loại</p>
            <p className="list-product-table-header-item">Remove</p>
          </div>
          <div className="list-product-table-content">
            {allproducts.map((product, index) => {
              return (
                <div key={index} className="list-product-table-row">
                  <img
                    src={product.image}
                    alt=""
                    className="list-product-table-row-image"
                  />
                  <p className="list-product-table-row-item">{product.name}</p>
                  <p className="list-product-table-row-item">
                    {product.old_price}vnd
                  </p>
                  <p className="list-product-table-row-item">
                    {product.new_price}vnd
                  </p>
                  <p className="list-product-table-row-item">
                    {product.category}
                  </p>
                  <img
                    onClick={() => {
                      remove_product(product.id);
                    }}
                    src={cross_icon}
                    alt=""
                    className="list-product-table-row-remove-icon"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProduct;
