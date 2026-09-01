import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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
  Spin,
} from 'antd';
import { InboxOutlined, CloseOutlined } from '@ant-design/icons';
import { COMPLAINT_TYPE_OPTIONS } from '../constants/queriesCases';
import { createPortalIssue } from '../api/issue.api';
import { useLookup } from '../contexts/lookupContext';
import { useProfile } from '../contexts/profileContext';
import {
  buildPortalComplaintPayload,
  filterComplaintTypeLookups,
  getIssueApiErrorMessage,
  isIssueApiSuccess,
  isMemberOnMemberComplaintType,
  isMemberOnServiceProviderComplaintType,
  mapComplaintTypeLookupOptions,
} from '../helpers/issues.helper';

const { TextArea } = Input;
const { Dragger } = Upload;

const selectFilterOption = (input, option) =>
  String(option?.label || option?.children || '')
    .toLowerCase()
    .includes(input.toLowerCase());

const QueriesCreate = () => {
  const navigate = useNavigate();
  const { user, userDetail } = useSelector(state => state.auth);
  const { lookups } = useLookup();
  const { profileDetail, profileByIdDetail } = useProfile();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const complaintType = Form.useWatch('complaintType', form);

  const complaintTypeLookups = useMemo(
    () => filterComplaintTypeLookups(lookups),
    [lookups],
  );

  const complaintTypeOptions = useMemo(() => {
    const lookupOptions = mapComplaintTypeLookupOptions(lookups);
    return lookupOptions.length > 0 ? lookupOptions : COMPLAINT_TYPE_OPTIONS;
  }, [lookups]);

  const isMemberOnMember = useMemo(
    () => isMemberOnMemberComplaintType(complaintType, complaintTypeLookups),
    [complaintType, complaintTypeLookups],
  );

  const isMemberOnServiceProvider = useMemo(
    () =>
      isMemberOnServiceProviderComplaintType(
        complaintType,
        complaintTypeLookups,
      ),
    [complaintType, complaintTypeLookups],
  );

  const complainantProfileId = profileDetail?.profileId;

  const complainantLabel = useMemo(() => {
    const personal =
      profileByIdDetail?.personalInfo ||
      profileDetail?.personalInfo ||
      profileDetail?.contactInfo ||
      {};
    const name =
      [personal?.forename, personal?.surname].filter(Boolean).join(' ') ||
      [user?.userFirstName, user?.userLastName].filter(Boolean).join(' ') ||
      [userDetail?.userFirstName, userDetail?.userLastName]
        .filter(Boolean)
        .join(' ') ||
      user?.fullName ||
      userDetail?.userName ||
      'Current member';
    const membershipNumber =
      profileDetail?.membershipNumber ||
      profileByIdDetail?.membershipNumber ||
      '';

    return membershipNumber ? `${name} (${membershipNumber})` : name;
  }, [profileDetail, profileByIdDetail, user, userDetail]);

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

  useEffect(() => {
    if (!isMemberOnServiceProvider) {
      form.setFieldValue('serviceProvider', undefined);
    }
  }, [isMemberOnServiceProvider, form]);

  useEffect(() => {
    if (!isMemberOnMember) {
      form.setFieldValue('relatedMember', undefined);
      form.setFieldValue('complainantId', undefined);
      return;
    }

    if (complainantProfileId) {
      form.setFieldValue('complainantId', complainantProfileId);
    }
  }, [isMemberOnMember, complainantProfileId, form]);

  const handleSaveDraft = () => {
    navigate('/queries');
  };

  const handleSubmitCase = async () => {
    try {
      if (isMemberOnMember && !complainantProfileId) {
        toast.error('Unable to identify complainant profile. Please try again.');
        return;
      }

      const values = await form.validateFields();
      setSubmitting(true);

      const payload = buildPortalComplaintPayload({
        description: values.incidentDescription,
        dateReceived: values.incidentDate,
        complaintType: values.complaintType,
        relatedMember: values.relatedMember,
        serviceProvider: values.serviceProvider,
        complainantId: values.complainantId || complainantProfileId,
        complaintTypeLookups,
      });

      const files = fileList.map(file => file.originFileObj || file);
      const response = await createPortalIssue(payload, files);

      if (isIssueApiSuccess(response)) {
        toast.success('Complaint submitted successfully');
        navigate('/queries');
        return;
      }

      toast.error(getIssueApiErrorMessage(response, 'Failed to submit complaint'));
    } catch (error) {
      if (error?.errorFields) return;
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.png,.jpg,.jpeg,.docx',
    fileList,
    beforeUpload: file => {
      setFileList(prev => [...prev, file]);
      return false;
    },
    onRemove: file => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card title="New Complaint" className="shadow-sm">
        <Spin spinning={submitting}>
          <Form form={form} layout="vertical">
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="incidentDescription"
                  label="Description"
                  rules={[
                    { required: true, message: 'Please enter a description.' },
                  ]}>
                  <TextArea
                    rows={4}
                    placeholder="Detailed description of the complaint..."
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="incidentDate"
                  label="Date Received"
                  rules={[
                    { required: true, message: 'Please select date received.' },
                  ]}>
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="complaintType"
                  label="Complaint Type"
                  rules={[
                    { required: true, message: 'Please select complaint type.' },
                  ]}>
                  <Select
                    placeholder="Select complaint type"
                    size="large"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    filterOption={selectFilterOption}
                    popupRender={renderClearableDropdown('complaintType')}
                    options={complaintTypeOptions}
                  />
                </Form.Item>
              </Col>

              {isMemberOnServiceProvider ? (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="serviceProvider"
                    label="Service Provider"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter a service provider.',
                      },
                    ]}>
                    <Input
                      placeholder="Enter service provider name"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              ) : null}

              {isMemberOnMember ? (
                <>
                  <Col xs={24} md={12}>
                    <Form.Item name="complainantId" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Complainant"
                      extra="You are recorded as the complainant for this case.">
                      <Input
                        value={complainantLabel}
                        readOnly
                        disabled
                        size="large"
                        placeholder="Loading your profile..."
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="relatedMember"
                      label="Related Member"
                      extra="Enter member name or membership number."
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the related member.',
                        },
                      ]}>
                      <Input
                        placeholder="Enter member name or number"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </>
              ) : null}

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
                {fileList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3 mb-4">
                    {fileList.map((file, index) => (
                      <Tag
                        key={file.uid ?? index}
                        closable
                        onClose={() => {
                          setFileList(prev =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        className="pl-3 pr-1 py-1 rounded-full bg-blue-50 text-blue-700 border-0">
                        <span
                          className="max-w-[180px] truncate inline-block align-middle"
                          title={file.name}>
                          {file.name}
                        </span>
                        <CloseOutlined className="ml-1 text-xs" />
                      </Tag>
                    ))}
                  </div>
                ) : null}
              </Col>
            </Row>

            <Form.Item className="mb-0 mt-2">
              <Space size="middle">
                <Button size="large" onClick={handleSaveDraft} disabled={submitting}>
                  Save Draft
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  onClick={handleSubmitCase}>
                  Submit Complaint
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default QueriesCreate;
