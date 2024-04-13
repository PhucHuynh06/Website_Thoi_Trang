const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { log } = require("console");

app.use(express.json());
app.use(cors());

//Database ket noi MongoDB
mongoose.connect(
  "mongodb+srv://phucconals:Phuc260394@webbanquanao.s0cstq2.mongodb.net/Website-ban-quan-ao"
);

//API Creation

const Schema = mongoose.Schema;
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

//Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

//Creating Upload Endpoint for image
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

//Schema for Creating Products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Creating API For deleting Products
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Creating API for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

//Schema Creating for user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Creating Endpoint for registering the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      error: "existing user found with same email address",
    });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

//Creating endpoint for user login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password!" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id!" });
  }
});

//Creating endpoint for newcollection data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollections Fetched");
  res.send(newcollection);
});

//Creating endpoint for popular in women section
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fectched");
  res.send(popular_in_women);
});

//Creating middelware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res
        .status(401)
        .send({ errors: "Please authenticate using a valid token" });
    }
  }
};

// Creating endpoint for adding products in cart data
app.post("/addtocart", fetchUser, async (req, res) => {
  console.log("Added", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

//Creating endpoint to remove product from cartdata
app.post("/removefromcart", fetchUser, async (req, res) => {
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await Users.findByIdAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

//Creating endpoint to get cartdata
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("GetCart");
  let userData = await Users.findOne({ _id: req.user.id });
  let cartStatus = await Order.findOne({ customer: userData });
  res.json({
    cartData: userData.cartData,
    cartStatus: cartStatus ? cartStatus.status : "",
  });
});

//Category model
const Category = mongoose.model("Category", {
  name: {
    type: String,
    required: true,
  },
});

// get all categories
app.get("/categories", async (req, res) => {
  console.log("GetCategory");
  let categories = await Category.find({});
  res.json(categories);
});

//delete category
app.post("/removecategory", async (req, res) => {
  await Category.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//add category
app.post("/addtocategory", async (req, res) => {
  const { category } = req.body;
  console.log(req.body);
  console.log("cate", category);
  const isExist = await Category.findOne({ name: category });

  if (!isExist) {
    try {
      await Category.create({ name: category });
      return res.status(201).json({ message: "Đã thêm thành công thể loại" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Lỗi xảy ra khi thêm thể loại" });
    }
  } else {
    return res.status(404).json({ message: "Thể loại này đã tồn tại!" });
  }
});

//creating order model

const Order = mongoose.model("Order", {
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Users", // This should match the model name you used when defining the Users model
    required: true,
  },
  product: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  note: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Đang chờ xử lý", "Đang giao hàng", "Hoàn thành"],
    default: "Đang chờ xử lý",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

async function getProducts(orderData) {
  const products = [];
  for (const e of orderData.products) {
    try {
      const product = await Product.findOne({ id: e.product_id });
      products.push({
        productId: product._id, // Assuming _id is the product identifier
        quantity: e.quantity,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      // Handle errors appropriately (e.g., skip the product or return an error object)
    }
  }
  return products;
}

app.post("/ordering", fetchUser, async (req, res) => {
  //const all_product = req.body;
  const { orderData } = req.body;

  let productArray = [];

  await getProducts(orderData)
    .then((products) => {
      productArray = [...products]; // Now 'products' will contain the resolved product details
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });

  let userData = await Users.findOne({ _id: req.user.id });
  // console.log(userData._id);
  // console.log(orderData);
  let isExistedOrder = await Order.findOne({ customer: userData });
  if (!isExistedOrder) {
    const order = new Order({
      customer: userData,
      product: productArray,
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      note: orderData.note,
      shippingAddress: orderData.address,
      totalPrice: orderData.totalAmount,
    });
    Order.create(order);
    return res.status(201).json({ message: "Đã đặt hàng thành công!" });
  } else {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        { _id: isExistedOrder._id }, // Giả sử userData có trường _id
        {
          $set: {
            // Sử dụng toán tử $set để cập nhật các trường cụ thể
            product: productArray,
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
            note: orderData.note,
            shippingAddress: orderData.address,
            totalPrice: orderData.totalAmount,
          },
        },
        { new: true } // Trả về tài liệu đã cập nhật (tùy chọn)
      );

      return res.status(201).json({ message: "Đã cập nhật thành công!" });

      // Sử dụng dữ liệu đơn hàng đã cập nhật
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      // Xử lý lỗi (ví dụ: ném ngoại lệ)
    }
  }
});

app.post("/cancelorder", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    await Order.findOneAndDelete({ customer: userData });
    return res.status(201).json({ message: "Đã hủy đơn hàng thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra khi hủy đơn hàng" });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port" + port);
  } else {
    console.log("Error : " + error);
  }
});