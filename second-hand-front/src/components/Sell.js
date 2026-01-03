// api POST /upload (POST /items)
// Authorization: Bearer <token>
// {
//   "title": "Used Laptop",
//   "description": "Good condition, lightly used. Includes charger.",
//   "contact_info": "seller@email.com",
//   "price": "300",
//   "negotiable": true,
//   "zip_code": "12345",
// }
// images: multipart/form-data

import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY, BASE_URL } from "../constants";

import NavBar from "./NavBarNew";
import "../styles/Sell.css";

import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Upload,
  message,
} from "antd";

const MAX_SIZE_MB = 5;

const { Dragger } = Upload;
const { TextArea } = Input;

function Sell({ handleLogout }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const imageCount = fileList.length;
  const canPublish = useMemo(() => {
    return isFormValid && imageCount >= 1 && imageCount <= 5 && !submitting;
  }, [isFormValid, imageCount, submitting]);

  const uploadProps = {
    multiple: true,
    accept: "image/*",
    fileList,
    beforeUpload: (file) => {
      // 5 images max
      if (fileList.length >= 5) {
        message.error("You can upload up to 5 images only.");
        return Upload.LIST_IGNORE;
      }

      if (!file.type.startsWith("image/")) {
        message.error("Only image files are allowed.");
        return Upload.LIST_IGNORE;
      }

      // max size 5mb each image
      if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
        message.error("Image must be smaller than 5MB.");
        return Upload.LIST_IGNORE;
      }

      return false;
    },
    onChange: (info) => {
      const next = info.fileList.slice(0, 5);
      setFileList(next);
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const onFinish = async (values) => {
    if (imageCount < 1) {
      message.error("Please upload at least 1 image.");
      return;
    }
    if (imageCount > 5) {
      message.error("You can upload at most 5 images.");
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      message.error("Not logged in. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("description", values.description);
      fd.append("contact_info", values.contact);
      fd.append("price", String(values.price));
      fd.append("negotiable", String(values.negotiable));
      fd.append("zip_code", values.zipCode);

      fileList.forEach((f) => {
        if (f.originFileObj) fd.append("images", f.originFileObj);
      });

      await axios.post(`${BASE_URL}/upload`, fd, { // POST /items
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success("Published successfully!");
      navigate("/mylistings"); //back to mylistings afte publication
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to publish item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sell-page">
      <NavBar />

      <div className="sell-wrap">
        <Card className="sell-card" title="Publish a New Item" bordered={false}>
          <Form
            requiredMark={false}
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFieldsChange={() => {
              const hasErrors = form
                .getFieldsError()
                .some(({ errors }) => errors.length > 0);

              setIsFormValid(!hasErrors);
            }}
            initialValues={{
              negotiable: true,
              price: 0,
            }}
          >
            <div className="sell-row">
              <div className="sell-row-label">
                Item Name<span className="req">*</span>
              </div>
              <div className="sell-row-field">
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: "Item name is required" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input placeholder="Item name" />
                </Form.Item>
              </div>
            </div>

            <div className="sell-upload-center">
              <div className="sell-upload-hint">
                Images<span className="req">*</span> (min 1, max 5)
              </div>

              <Dragger {...uploadProps} className="sell-dragger">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag images to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support bulk upload. Only image files. Up to 5 images.
                </p>
              </Dragger>

              <div className="sell-upload-count">{imageCount}/5 selected</div>
            </div>

            <div className="sell-row-label">
              Description<span className="req">*</span>
            </div>
            <Form.Item
              name="description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <TextArea rows={5} placeholder="Item Description" />
            </Form.Item>

            <div className="sell-row-label">
              Contacts<span className="req">*</span>
            </div>
            <Form.Item
              name="contact"
              rules={[{ required: true, message: "Contact is required" }]}
            >
              <TextArea rows={3} placeholder="Email / Phone / etc..." />
            </Form.Item>

            <div className="sell-bottom-row">
              <Form.Item
                label={
                  <span className="sell-row-label">
                    Price<span className="req">*</span>
                  </span>
                }
                name="price"
                rules={[{ required: true, message: "Price is required" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} addonAfter="$" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="sell-row-label">
                    Negotiable?<span className="req">*</span>
                  </span>
                }
                name="negotiable"
              >
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label={
                  <span className="sell-row-label">
                    Zip Code<span className="req">*</span>
                  </span>
                }
                name="zipCode"
                rules={[{ required: true, message: "Zip code is required" }]}
              >
                <Input placeholder="Zip Code" />
              </Form.Item>
            </div>

            <div className="sell-actions">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={!canPublish}
                size="large"
              >
                Publish
              </Button>
              {!canPublish && (
                <div className="sell-actions-note">
                  please compelete all required<span className="req">*</span>{" "}
                  fields
                </div>
              )}
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default Sell;
