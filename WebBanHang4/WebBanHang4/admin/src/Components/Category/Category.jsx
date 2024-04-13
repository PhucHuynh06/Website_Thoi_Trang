import React, { useEffect, useState } from "react";
import cross_icon from "../../assets/cross_icon.png";
import "./Category.css";
import toast from "react-hot-toast";
import axios from "axios";

const Category = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState("");

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/categories")
      .then((res) => res.json())
      .then((data) => {
        setAllCategories(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeCategory = async (id) => {
    await fetch("http://localhost:4000/removecategory", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();
  };

  const addCategoryHandling = async () => {
    try {
      const { data } = await axios({
        method: "post",
        url: "http://localhost:4000/addtocategory",
        data: { category },
      });
      console.log(data);
      fetchInfo();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="category-wrapper">
      <div className="category-header">
        <h2 className="category-title">Danh mục</h2>
      </div>
      <div className="category-body">
        <div className="add-category-container">
          <label className="add-category-label" htmlFor="category">
            Thêm thể loại
          </label>
          <input
            className="add-category-input"
            name="category"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button
            className="add-category-button"
            onClick={() => addCategoryHandling()}
          >
            Thêm
          </button>
        </div>
        <div className="category-list">
          <ul>
            {allCategories.length > 0 ? (
              allCategories.map((item, index) => (
                <div key={index} className="category-item">
                  <li className="category-item-name">{item.name}</li>
                  <img
                    className="category-item-remove-icon"
                    onClick={() => removeCategory(item.id)}
                    src={cross_icon}
                    alt=""
                  />
                </div>
              ))
            ) : (
              <div className="category-empty">Chưa có danh mục nào</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Category;
