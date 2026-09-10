import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Empty, Input, Modal, Spin, Tag, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  SendOutlined,
  TeamOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import {
  createPortalIssueActivity,
  deletePortalIssueActivity,
  deletePortalIssueActivityAttachment,
  downloadPortalIssueActivityAttachment,
  fetchPortalIssueActivities,
  fetchPortalIssueById,
  fetchPortalIssueHistory,
  updatePortalIssueActivity,
} from '../api/issue.api';
import {
  formatDisplayValue,
  formatIssueDateTime,
  getHistoryActionColor,
  getIssueApiErrorMessage,
  isIssueApiSuccess,
  mapPortalIssueActivities,
  mapPortalIssueDetail,
  mapPortalIssueHistory,
  parseAttachmentDownloadResponse,
  parseIssueDetailResponse,
  triggerUrlDownload,
} from '../helpers/issues.helper';

const { TextArea } = Input;

const CollapsibleSection = ({
  title,
  icon,
  badge,
  subtitle,
  expanded,
  onToggle,
  headerExtra,
  children,
}) => (
  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-3 text-left"
      aria-expanded={expanded}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {badge}
        </div>
        {subtitle ? (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        {expanded ? <UpOutlined /> : <DownOutlined />}
      </span>
    </button>

    {expanded ? (
      <div className="mt-4 border-t border-slate-100 pt-4">
        {headerExtra ? <div className="mb-4">{headerExtra}</div> : null}
        {children}
      </div>
    ) : null}
  </section>
);

const getStatusColor = status => {
  const value = String(status || '').toLowerCase();
  if (value.includes('closed') || value.includes('resolved')) return 'success';
  if (value.includes('progress') || value.includes('pending')) return 'warning';
  if (value.includes('open') || value.includes('active') || value.includes('new')) {
    return 'processing';
  }
  return 'default';
};

const getPriorityColor = priority => {
  const value = String(priority || '').toLowerCase();
  if (value.includes('high') || value.includes('urgent')) return 'error';
  if (value.includes('medium')) return 'warning';
  if (value.includes('low')) return 'default';
  return 'processing';
};

const SummaryRow = ({ label, children, icon }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
      {icon}
      {label}
    </span>
    <div className="max-w-[60%] text-right text-sm font-semibold text-slate-900">
      {children}
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="mb-1 mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
    {children}
  </p>
);

const AttachmentCard = ({
  name,
  createdAt,
  downloading,
  onDownload,
  onRemove,
  removing,
}) => (
  <div className="flex w-[112px] flex-col items-center rounded-lg border border-slate-200 bg-white px-2 py-2 text-center shadow-sm">
    <div className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
      <FileTextOutlined className="text-[22px] text-red-500" />
    </div>
    <p
      className="w-full break-words text-[11px] font-semibold leading-[1.2] text-slate-800"
      title={name}>
      {name || 'Attachment'}
    </p>
    {createdAt ? (
      <p className="mt-0.5 text-[9px] leading-none text-slate-400">{createdAt}</p>
    ) : null}
    <div className="mt-1.5 flex items-center gap-3 text-slate-600">
      {onDownload ? (
        <button
          type="button"
          className="inline-flex items-center justify-center transition hover:text-blue-600 disabled:opacity-50"
          onClick={onDownload}
          disabled={downloading}
          title="Download"
          aria-label="Download attachment">
          <DownloadOutlined className="text-sm" />
        </button>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          className="inline-flex items-center justify-center transition hover:text-red-600 disabled:opacity-50"
          onClick={onRemove}
          disabled={removing}
          title="Remove"
          aria-label="Remove attachment">
          <DeleteOutlined className="text-sm" />
        </button>
      ) : null}
    </div>
  </div>
);

const QueriesDetail = () => {
  const navigate = useNavigate();
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [commentFile, setCommentFile] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [editingActivityId, setEditingActivityId] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [savingActivityId, setSavingActivityId] = useState('');
  const [deletingActivityId, setDeletingActivityId] = useState('');
  const [deletingAttachmentKey, setDeletingAttachmentKey] = useState('');
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const loadIssue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPortalIssueById(issueId);
      if (isIssueApiSuccess(response)) {
        setIssue(mapPortalIssueDetail(parseIssueDetailResponse(response)));
      } else {
        setIssue(null);
        toast.error(
          getIssueApiErrorMessage(response, 'Failed to load case details'),
        );
      }
    } catch (error) {
      setIssue(null);
      toast.error('Failed to load case details');
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const response = await fetchPortalIssueActivities(issueId);
      if (isIssueApiSuccess(response)) {
        setActivities(mapPortalIssueActivities(response));
      } else {
        setActivities([]);
        toast.error(
          getIssueApiErrorMessage(response, 'Failed to load activities'),
        );
      }
    } catch (error) {
      setActivities([]);
      toast.error('Failed to load activities');
    } finally {
      setActivitiesLoading(false);
    }
  }, [issueId]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await fetchPortalIssueHistory(issueId);
      if (isIssueApiSuccess(response)) {
        setHistory(mapPortalIssueHistory(response));
      } else {
        setHistory([]);
        toast.error(
          getIssueApiErrorMessage(response, 'Failed to load history'),
        );
      }
    } catch (error) {
      setHistory([]);
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    loadIssue();
    loadActivities();
    loadHistory();
  }, [loadIssue, loadActivities, loadHistory]);

  const handleSubmitComment = async () => {
    const trimmedBody = commentBody.trim();
    if (!trimmedBody && !commentFile) {
      toast.error('Please enter a comment or attach a file.');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await createPortalIssueActivity(issueId, {
        body: trimmedBody,
        file: commentFile,
      });

      if (isIssueApiSuccess(response)) {
        toast.success(
          commentFile ? 'Comment with attachment added' : 'Comment added',
        );
        setCommentBody('');
        setCommentFile(null);
        await Promise.all([loadActivities(), loadHistory(), loadIssue()]);
        return;
      }

      toast.error(getIssueApiErrorMessage(response, 'Failed to add comment'));
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const resolveActivityAttachmentUrl = async (activity, attachment) => {
    if (attachment?.url) return attachment.url;

    const response = await downloadPortalIssueActivityAttachment(
      issueId,
      activity.id,
      attachment.index,
    );

    if (!isIssueApiSuccess(response)) {
      throw new Error(
        getIssueApiErrorMessage(response, 'Failed to open attachment'),
      );
    }

    const downloadInfo = parseAttachmentDownloadResponse(response);
    if (!downloadInfo?.url) {
      throw new Error('Download link was not returned by the server.');
    }

    return downloadInfo.url;
  };

  const handleDownloadAttachment = async (activity, attachment) => {
    const downloadKey = `${activity.id}-${attachment.index}`;
    setDownloadingKey(downloadKey);

    try {
      const url = await resolveActivityAttachmentUrl(activity, attachment);
      triggerUrlDownload(url, attachment.name || 'attachment');
    } catch (error) {
      toast.error(error?.message || 'Failed to download attachment');
    } finally {
      setDownloadingKey('');
    }
  };

  const startEditActivity = activity => {
    setEditingActivityId(activity.id);
    setEditingBody(activity.body || '');
  };

  const cancelEditActivity = () => {
    setEditingActivityId('');
    setEditingBody('');
  };

  const handleUpdateActivity = async activity => {
    const trimmedBody = editingBody.trim();
    if (!trimmedBody) {
      toast.error('Please enter a comment.');
      return;
    }

    setSavingActivityId(activity.id);
    try {
      const response = await updatePortalIssueActivity(issueId, activity.id, {
        body: trimmedBody,
      });

      if (isIssueApiSuccess(response)) {
        toast.success('Comment updated');
        cancelEditActivity();
        await Promise.all([loadActivities(), loadHistory()]);
        return;
      }

      toast.error(getIssueApiErrorMessage(response, 'Failed to update comment'));
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setSavingActivityId('');
    }
  };

  const handleDeleteActivity = activity => {
    Modal.confirm({
      title: 'Delete comment',
      content: 'Are you sure you want to delete this comment? This cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        setDeletingActivityId(activity.id);
        try {
          const response = await deletePortalIssueActivity(issueId, activity.id);
          if (isIssueApiSuccess(response)) {
            toast.success('Comment deleted');
            if (editingActivityId === activity.id) {
              cancelEditActivity();
            }
            await Promise.all([loadActivities(), loadHistory(), loadIssue()]);
            return;
          }
          toast.error(
            getIssueApiErrorMessage(response, 'Failed to delete comment'),
          );
        } catch (error) {
          toast.error('Failed to delete comment');
        } finally {
          setDeletingActivityId('');
        }
      },
    });
  };

  const handleDeleteAttachment = (activity, attachment) => {
    Modal.confirm({
      title: 'Remove attachment',
      content: `Remove "${attachment.name}" from this comment?`,
      okText: 'Remove',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        const deleteKey = `${activity.id}-${attachment.index}`;
        setDeletingAttachmentKey(deleteKey);
        try {
          const response = await deletePortalIssueActivityAttachment(
            issueId,
            activity.id,
            attachment.index,
          );
          if (isIssueApiSuccess(response)) {
            toast.success('Attachment removed');
            await Promise.all([loadActivities(), loadHistory()]);
            return;
          }
          toast.error(
            getIssueApiErrorMessage(response, 'Failed to remove attachment'),
          );
        } catch (error) {
          toast.error('Failed to remove attachment');
        } finally {
          setDeletingAttachmentKey('');
        }
      },
    });
  };

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'comments') {
      return activities.filter(activity => {
        const type = String(activity.type || '').toLowerCase();
        return !type || type.includes('comment') || Boolean(activity.body);
      });
    }
    return activities;
  }, [activities, activityFilter]);

  const activityAttachments = useMemo(
    () =>
      activities.flatMap(activity =>
        (activity.attachments || []).map(attachment => ({
          ...attachment,
          activity,
        })),
      ),
    [activities],
  );

  const issueAttachments = issue?.attachments || [];
  const attachmentCount = issueAttachments.length + activityAttachments.length;

  const caseReference =
    issue?.internalReferenceNumber || issue?.caseTitle || issue?.id || '';
  const caseTitle = issue?.caseTitle || caseReference;
  const hasDistinctReference =
    Boolean(issue?.internalReferenceNumber) &&
    String(issue.internalReferenceNumber).trim() !==
      String(issue?.caseTitle || '').trim();
  const statusLabel = issue?.issueStatus || issue?.status || 'Open';
  const statusColor = getStatusColor(statusLabel);
  const isResolved =
    String(statusLabel).toLowerCase().includes('closed') ||
    String(statusLabel).toLowerCase().includes('resolved') ||
    Boolean(issue?.resolution && issue.resolution !== '—');
  const complaintTypeLabel =
    issue?.complaintTypeLabel || issue?.complaintType || '';

  const commentUploadProps = {
    maxCount: 1,
    accept: '.pdf,.png,.jpg,.jpeg,.docx',
    showUploadList: false,
    beforeUpload: file => {
      setCommentFile(file);
      return false;
    },
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3">
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/queries')}
          className="!w-fit">
          Back to Cases
        </Button>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Issues{' '}
              <span className="text-slate-300">/</span>{' '}
              <span className="font-semibold text-slate-700">Case Details</span>
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 font-poppins sm:text-3xl">
              {hasDistinctReference
                ? formatDisplayValue(caseTitle)
                : `Case ${formatDisplayValue(caseReference)}`}
            </h1>
          </div>
          <Tag
            color={statusColor}
            className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {statusLabel}
          </Tag>
        </div>
      </div>

      <Spin spinning={loading}>
        {!issue && !loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <Empty description="Case not found." />
          </div>
        ) : issue ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-5 xl:col-span-8">
              {isResolved && issue.resolution ? (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircleOutlined className="text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Resolution & Outcome
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {issue.resolution}
                  </p>
                  {issue.dateResolved ? (
                    <p className="mt-4 text-xs text-slate-500">
                      Resolved on {issue.dateResolved}
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Description
                    </h2>
                    <Tag className="m-0 rounded-full">Original Submission</Tag>
                  </div>
                  <span className="text-xs text-slate-500">
                    Submitted via Member Portal
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {formatDisplayValue(issue.description)}
                </p>
              </section>

              <CollapsibleSection
                title="Attachments"
                icon={<PaperClipOutlined className="text-blue-600" />}
                badge={
                  attachmentCount > 0 ? (
                    <Tag className="m-0 rounded-full">{attachmentCount}</Tag>
                  ) : null
                }
                subtitle={
                  attachmentCount > 0
                    ? `${attachmentCount} file${
                        attachmentCount === 1 ? '' : 's'
                      }`
                    : 'No files attached'
                }
                expanded={attachmentsExpanded}
                onToggle={() => setAttachmentsExpanded(prev => !prev)}>
                {attachmentCount === 0 ? (
                  <Empty
                    description="No attachments yet."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {issueAttachments.map((attachment, index) => (
                      <AttachmentCard
                        key={`issue-${attachment.id || index}`}
                        name={attachment.name || `Attachment ${index + 1}`}
                        createdAt={attachment.createdAt}
                        onDownload={
                          attachment.url
                            ? () =>
                                triggerUrlDownload(
                                  attachment.url,
                                  attachment.name || 'attachment',
                                )
                            : undefined
                        }
                      />
                    ))}

                    {activityAttachments.map(attachment => {
                      const downloadKey = `${attachment.activity.id}-${attachment.index}`;
                      const deleteKey = `${attachment.activity.id}-${attachment.index}`;
                      return (
                        <AttachmentCard
                          key={`activity-${attachment.activity.id}-${attachment.index}`}
                          name={attachment.name}
                          createdAt={attachment.createdAt}
                          downloading={downloadingKey === downloadKey}
                          removing={deletingAttachmentKey === deleteKey}
                          onDownload={() =>
                            handleDownloadAttachment(
                              attachment.activity,
                              attachment,
                            )
                          }
                          onRemove={() =>
                            handleDeleteAttachment(
                              attachment.activity,
                              attachment,
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                title="Activity & Messages"
                badge={
                  <Tag className="m-0 rounded-full">
                    {activities.length} update
                    {activities.length === 1 ? '' : 's'}
                  </Tag>
                }
                expanded={activityExpanded}
                onToggle={() => setActivityExpanded(prev => !prev)}
                headerExtra={
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'All Activity' },
                      { key: 'comments', label: 'Comments Only' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActivityFilter(tab.key)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          activityFilter === tab.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                }>
                <Spin spinning={activitiesLoading}>
                  {filteredActivities.length === 0 ? (
                    <Empty
                      description="No activity yet."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <div className="relative space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-slate-200">
                      {filteredActivities.map(activity => (
                        <div key={activity.id} className="relative pl-10">
                          <span className="absolute left-2 top-3 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow" />
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs text-slate-500">
                                  {activity.createdAt ||
                                    formatIssueDateTime(activity.createdAtRaw) ||
                                    'Date unavailable'}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                <Tag className="w-fit capitalize">
                                  {String(activity.type || 'COMMENT').toLowerCase()}
                                </Tag>
                                {editingActivityId !== activity.id ? (
                                  <>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<EditOutlined />}
                                      onClick={() => startEditActivity(activity)}>
                                      Edit
                                    </Button>
                                    <Button
                                      type="default"
                                      size="small"
                                      variant="default"
                                      icon={<DeleteOutlined />}
                                      loading={deletingActivityId === activity.id}
                                      onClick={() => handleDeleteActivity(activity)}>
                                      Delete
                                    </Button>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            {editingActivityId === activity.id ? (
                              <div className="mt-3 space-y-3">
                                <TextArea
                                  rows={3}
                                  value={editingBody}
                                  onChange={event => setEditingBody(event.target.value)}
                                  className="!rounded-xl"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <Button type="default" onClick={cancelEditActivity}>
                                    Cancel
                                  </Button>
                                  <Button
                                    type="primary"
                                    loading={savingActivityId === activity.id}
                                    onClick={() => handleUpdateActivity(activity)}>
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : activity.body ? (
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                {activity.body}
                              </p>
                            ) : null}

                            {activity.attachments?.length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {activity.attachments.map(attachment => {
                                  const downloadKey = `${activity.id}-${attachment.index}`;
                                  const deleteKey = `${activity.id}-${attachment.index}`;
                                  return (
                                    <AttachmentCard
                                      key={`${activity.id}-${attachment.index}`}
                                      name={attachment.name}
                                      createdAt={attachment.createdAt}
                                      downloading={downloadingKey === downloadKey}
                                      removing={deletingAttachmentKey === deleteKey}
                                      onDownload={() =>
                                        handleDownloadAttachment(
                                          activity,
                                          attachment,
                                        )
                                      }
                                      onRemove={() =>
                                        handleDeleteAttachment(
                                          activity,
                                          attachment,
                                        )
                                      }
                                    />
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Spin>
              </CollapsibleSection>

              <CollapsibleSection
                title="History"
                icon={<ClockCircleOutlined className="text-blue-600" />}
                badge={
                  <Tag className="m-0 rounded-full">
                    {history.length} event{history.length === 1 ? '' : 's'}
                  </Tag>
                }
                expanded={historyExpanded}
                onToggle={() => setHistoryExpanded(prev => !prev)}>
                <Spin spinning={historyLoading}>
                  {history.length === 0 ? (
                    <Empty
                      description="No history yet."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <div className="relative space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-slate-200">
                      {history.map(entry => (
                        <div key={entry.id} className="relative pl-10">
                          <span className="absolute left-2 top-3 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-400 shadow" />
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {entry.summary}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {entry.actorName ||
                                    entry.actorEmail ||
                                    'Unknown actor'}
                                  {' · '}
                                  {entry.createdAt ||
                                    formatIssueDateTime(entry.createdAtRaw) ||
                                    'Date unavailable'}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                {entry.action ? (
                                  <Tag
                                    color={getHistoryActionColor(entry.action)}
                                    className="m-0 capitalize">
                                    {String(entry.action).toLowerCase()}
                                  </Tag>
                                ) : null}
                                {entry.entityType ? (
                                  <Tag className="m-0 capitalize">
                                    {String(entry.entityType).toLowerCase()}
                                  </Tag>
                                ) : null}
                              </div>
                            </div>
                            {entry.changedFields?.length ? (
                              <ul className="mt-3 space-y-1 border-t border-slate-200 pt-3">
                                {entry.changedFields.map((field, index) => {
                                  const label =
                                    field?.field ||
                                    field?.name ||
                                    field?.key ||
                                    `Field ${index + 1}`;
                                  const from =
                                    field?.from ?? field?.oldValue ?? '—';
                                  const to =
                                    field?.to ?? field?.newValue ?? '—';
                                  return (
                                    <li
                                      key={`${entry.id}-field-${index}`}
                                      className="text-xs text-slate-600">
                                      <span className="font-semibold text-slate-800">
                                        {label}:
                                      </span>{' '}
                                      {String(from)} → {String(to)}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Spin>
              </CollapsibleSection>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-base font-bold text-slate-900">
                    Add a comment or inquiry
                  </h2>
                  {isResolved ? (
                    <p className="text-xs text-slate-500">
                      Case is resolved — replies will notify the assigned team.
                    </p>
                  ) : null}
                </div>

                <TextArea
                  rows={4}
                  value={commentBody}
                  onChange={event => setCommentBody(event.target.value)}
                  placeholder="Type your message or response to the support team..."
                  className="!rounded-xl"
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Upload {...commentUploadProps}>
                      <Button icon={<PaperClipOutlined />}>Attach file</Button>
                    </Upload>
                    {commentFile ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {commentFile.name}
                        <button
                          type="button"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => setCommentFile(null)}>
                          ×
                        </button>
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="default"
                      onClick={() => {
                        setCommentBody('');
                        setCommentFile(null);
                      }}>
                      Clear
                    </Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={submittingComment}
                      onClick={handleSubmitComment}>
                      Send Message
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-5 xl:col-span-4">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-3 text-base font-bold text-slate-900">
                  Query Summary
                </h2>

                <SectionLabel>Case Overview</SectionLabel>
                {hasDistinctReference ? (
                  <SummaryRow label="Reference">
                    {formatDisplayValue(issue.internalReferenceNumber)}
                  </SummaryRow>
                ) : null}
                <SummaryRow label="Issue Type">
                  {formatDisplayValue(issue.issueType)}
                </SummaryRow>
                <SummaryRow label="Complaint Type">
                  {formatDisplayValue(complaintTypeLabel)}
                </SummaryRow>

                <SectionLabel>Dates</SectionLabel>
                <SummaryRow label="Received" icon={<CalendarOutlined />}>
                  {formatDisplayValue(issue.dateReceived)}
                </SummaryRow>
                {issue.dueDate ? (
                  <SummaryRow label="Due Date" icon={<ClockCircleOutlined />}>
                    {formatDisplayValue(issue.dueDate)}
                  </SummaryRow>
                ) : null}
                {issue.dateResolved ? (
                  <SummaryRow
                    label="Resolved"
                    icon={<CheckCircleOutlined className="text-emerald-500" />}>
                    {formatDisplayValue(issue.dateResolved)}
                  </SummaryRow>
                ) : null}
                <SummaryRow label="Last Activity" icon={<ClockCircleOutlined />}>
                  {formatDisplayValue(issue.lastActivityAt)}
                </SummaryRow>

                <SectionLabel>Status Context</SectionLabel>
                <SummaryRow label="Priority">
                  <Tag
                    color={getPriorityColor(issue.priority)}
                    className="m-0 rounded-full">
                    {formatDisplayValue(issue.priority)}
                  </Tag>
                </SummaryRow>
                <SummaryRow label="Assigned Team">
                  <span className="inline-flex items-center justify-end gap-1">
                    <TeamOutlined className="text-slate-400" />
                    {formatDisplayValue(issue.ownerTeam)}
                  </span>
                </SummaryRow>
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-bold text-slate-900">
                  Need further assistance?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Use the comment box below to follow up. Include your case
                  reference from the summary when contacting support.
                </p>
              </section>
            </aside>
          </div>
        ) : null}
      </Spin>
    </div>
  );
};

export default QueriesDetail;
