import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Write = () => {
  const state = useLocation().state;
  const [value, setValue] = useState(state?.desc || "");
  const [title, setTitle] = useState(state?.title || "");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters.";
    }

    if (!file && !state) {
      newErrors.file = "Image is required.";
    }

    if (!cat) {
      newErrors.cat = "Please select a category.";
    }

    if (!value.trim()) {
      newErrors.value = "Description is required.";
    } else if (value.length > 10000) {
      newErrors.value = "Description cannot exceed 10,000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleClick = async (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   const imgUrl = file ? await upload() : state?.img || "";

  //   try {
  //     if (state) {
  //       await axios.put(`/posts/${state.id}`, {
  //         title,
  //         desc: value,
  //         cat,
  //         img: file ? imgUrl : state.img || "",
  //       });
  //     } else {
  //       await axios.post(`/posts/`, {
  //         title,
  //         desc: value,
  //         cat,
  //         img: imgUrl,
  //         date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
  //       });
  //     }
  //     navigate("/");
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

 const handleClick = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const imgUrl = file ? await upload() : state?.img || "";

  try {
    if (state) {
      await axios.put(`/posts/${state.id}`, {
        title,
        desc: value,
        cat,
        img: file ? imgUrl : state.img || "",
      });
      toast.success("✅ Blog updated successfully!");
    } else {
      await axios.post(`/posts/`, {
        title,
        desc: value,
        cat,
        img: imgUrl,
        date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      });
      toast.success("✅ Blog created successfully!");
    }

    navigate("/");
  } catch (err) {
    console.error(err);
    toast.error("❌ Something went wrong. Please try again!");
  }
};


  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: "" }));
          }}
        />
        {errors.title && (
          <p style={{ color: "red", fontSize: "14px" }}>{errors.title}</p>
        )}

        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={(content) => {
              setValue(content);
              setErrors((prev) => ({ ...prev, value: "" }));
            }}
          />
        </div>
        {errors.value && (
          <p style={{ color: "red", fontSize: "14px" }}>{errors.value}</p>
        )}
      </div>

      <div className="menu">
        <div className="item">
          <h1>Publish</h1>
          <span>
            <b>Status: </b> Draft
          </span>
          <span>
            <b>Visibility: </b> Public
          </span>

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setErrors((prev) => ({ ...prev, file: "" }));
            }}
          />
          <label className="file" htmlFor="file">
            Upload Image
          </label>
          {errors.file && (
            <p style={{ color: "red", fontSize: "14px" }}>{errors.file}</p>
          )}

          {file && (
            <div style={{ marginTop: "20px" }}>
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "2px solid #ddd",
                }}
              />
              <p style={{ marginTop: "10px", color: "#555" }}>{file.name}</p>
            </div>
          )}

          <div className="buttons">
            <button>Save as a draft</button>
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>

        <div className="item">
          <h1>Category</h1>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "iot"}
              name="cat"
              value="iot"
              id="iot"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="iot">IoT & Connectivity</label>
          </div>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "edge-ai"}
              name="cat"
              value="edge-ai"
              id="edge-ai"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="edge-ai">Edge AI</label>
          </div>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "wearables"}
              name="cat"
              value="wearables"
              id="wearables"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="wearables">Technology</label>
          </div>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "healthtech"}
              name="cat"
              value="healthtech"
              id="healthtech"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="healthtech">HealthTech</label>
          </div>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "electronics"}
              name="cat"
              value="electronics"
              id="electronics"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="electronics">Electronics</label>
          </div>

          <div className="cat">
            <input
              type="radio"
              checked={cat === "software"}
              name="cat"
              value="software"
              id="software"
              onChange={(e) => {
                setCat(e.target.value);
                setErrors((prev) => ({ ...prev, cat: "" }));
              }}
            />
            <label htmlFor="software">Software & Cloud</label>
          </div>

          {errors.cat && (
            <p style={{ color: "red", fontSize: "14px" }}>{errors.cat}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Write;
