import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Button,
  Space,
  Tag,
  Row,
  Col,
} from 'antd';
import { InboxOutlined, CloseOutlined } from '@ant-design/icons';
import {
  CASE_CATEGORY_OPTIONS,
  AVAILABLE_STAFF,
} from '../constants/queriesCases';

const { TextArea } = Input;
const { Dragger } = Upload;

const selectFilterOption = (input, option) =>
  String(option?.label || option?.children || '')
    .toLowerCase()
    .includes(input.toLowerCase());

const QueriesCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const renderClearableDropdown = fieldName => menu => (
    <>
      <button
        type="button"
        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
        disabled={!form.getFieldValue(fieldName)}
        onMouseDown={event => event.preventDefault()}
        onClick={() => form.setFieldValue(fieldName, undefined)}>
        Clear selection
      </button>
      <div className="border-t border-gray-100" />
      {menu}
    </>
  );

  // Same logic as mobile: Save Draft → navigate back, no validation
  const handleSaveDraft = () => {
    navigate('/queries');
  };

  // Same as mobile: Submit Case → navigate back; web adds validation before submit
  const handleSubmitCase = () => {
    form
      .validateFields()
      .then(() => {
        navigate('/queries');
      })
      .catch(() => {});
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.png,.jpg,.jpeg,.docx',
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card title="New Query / Case" className="shadow-sm">
        <Form form={form} layout="vertical">
          <Row gutter={[16, 0]}>
            {/* Case Title - full width */}
            <Col xs={24}>
              <Form.Item
                name="caseTitle"
                label="Title"
                rules={[{ required: true, message: 'Please enter a title.' }]}
              >
                <Input
                  placeholder="Enter descriptive title."
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Description - full width */}
            <Col xs={24}>
              <Form.Item
                name="incidentDescription"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description.' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Detailed description of the incident..."
                />
              </Form.Item>
            </Col>

            {/* Incident Date | Location */}
            <Col xs={24} md={12}>
              <Form.Item
                name="incidentDate"
                label="Incident Date"
                rules={[
                  { required: true, message: 'Please select incident date.' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please enter location.' }]}
              >
                <Input
                  placeholder="City, Region or Branch"
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Category | Assigned To */}
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category.' }]}
              >
                <Select
                  placeholder="Select Category"
                  size="large"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  filterOption={selectFilterOption}
                  popupRender={renderClearableDropdown('category')}
                  options={CASE_CATEGORY_OPTIONS}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="assignedLead"
                label="Assigned To"
                rules={[
                  { required: true, message: 'Please select assigned lead.' },
                ]}
              >
                <Select
                  placeholder="Select Lead Counsel"
                  size="large"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  filterOption={selectFilterOption}
                  popupRender={renderClearableDropdown('assignedLead')}
                  options={AVAILABLE_STAFF.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Attachment - full width */}
            <Col xs={24}>
              <Form.Item name="attachment" label="Attachment">
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined
                      style={{ fontSize: 48, color: '#3b82f6' }}
                    />
                  </p>
                  <p className="ant-upload-text">Upload files</p>
                  <p className="ant-upload-hint">
                    Drag & drop or click to select PDFs, PNGs, or DOCX.
                  </p>
                </Dragger>
              </Form.Item>
              {fileList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {fileList.map((file, index) => (
                    <Tag
                      key={file.uid ?? index}
                      closable
                      onClose={() => {
                        const next = fileList.filter(
                          (_, i) => i !== index
                        );
                        setFileList(next);
                      }}
                      className="pl-3 pr-1 py-1 rounded-full bg-blue-50 text-blue-700 border-0"
                    >
                      <span
                        className="max-w-[180px] truncate inline-block align-middle"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <CloseOutlined className="ml-1 text-xs" />
                    </Tag>
                  ))}
                </div>
              )}
            </Col>
          </Row>

          {/* Action buttons - same as mobile: Save Draft (outlined), Submit Case (primary) */}
          <Form.Item className="mb-0 mt-2">
            <Space size="middle">
              <Button size="large" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitCase}
              >
                Submit Case
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default QueriesCreate;
