import { useState } from 'react';
import { Heart, Trash2, Reply, MessageCircle, ArrowRight } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment, useLikeComment } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth.store';
import { Avatar, PageLoader, EmptyState, Button, Textarea } from '../../components/ui';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommentData {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  replies?: CommentData[];
  _count?: { replies: number };
}

function CommentItem({ comment, campaignId, depth = 0 }: {
  comment: CommentData; campaignId: string; depth?: number;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const createComment = useCreateComment(campaignId);
  const deleteComment = useDeleteComment(campaignId);
  const likeComment = useLikeComment(campaignId);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await createComment.mutateAsync({ content: replyText, parentId: comment.id });
      setReplyText('');
      setShowReply(false);
      toast.success('Reply posted');
    } catch { toast.error('Failed to post reply'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment.mutateAsync(comment.id);
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleLike = async () => {
    try { await likeComment.mutateAsync(comment.id); }
    catch { /* ignore */ }
  };

  const isOwner = user?.id === comment.user.id;
  const isAdmin = user?.roles.includes('ADMIN');

  return (
    <div className={`${depth > 0 ? 'ml-10 border-l border-slate-200/70 dark:border-white/10 pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar
          name={`${comment.user.firstName} ${comment.user.lastName}`}
          src={comment.user.avatarUrl}
          size={depth > 0 ? 'sm' : 'md'}
        />
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 mb-1.5 shadow-soft dark:border-white/10 dark:bg-navy-900">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="font-display text-sm font-semibold text-navy-900 dark:text-slate-100 truncate">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 px-1">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors">
              <Heart size={13} /> {comment.likesCount > 0 && comment.likesCount}
            </button>
            {isAuthenticated && depth === 0 && (
              <button onClick={() => setShowReply(v => !v)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                <Reply size={13} /> Reply
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors ml-auto">
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-3 flex gap-2">
              <Avatar name={`${user?.firstName} ${user?.lastName}`} size="sm" />
              <div className="flex-1">
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.firstName}`}
                  rows={2}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    loading={createComment.isPending}
                    disabled={createComment.isPending || !replyText.trim()}
                    leftIcon={<Reply size={13} />}
                  >
                    Post reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} campaignId={campaignId} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated, user } = useAuthStore();
  const { data, isLoading } = useComments(campaignId, page);
  const createComment = useCreateComment(campaignId);

  const comments = (data?.data ?? []) as CommentData[];
  const meta = data?.meta;

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ content: newComment });
      setNewComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  return (
    <div className="space-y-5">
      {/* Post comment */}
      {isAuthenticated ? (
        <div className="flex gap-3">
          <Avatar name={`${user?.firstName} ${user?.lastName}`} />
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask a question"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmit}
                loading={createComment.isPending}
                disabled={createComment.isPending || !newComment.trim()}
                leftIcon={<MessageCircle size={15} />}
              >
                Post comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4 rounded-2xl border border-slate-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-navy-900">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
            <MessageCircle size={22} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign in to join the conversation.</p>
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
          >
            Sign in <ArrowRight size={15} />
          </a>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? <PageLoader /> : comments.length === 0 ? (
        <EmptyState icon={<MessageCircle size={28} />} title="No comments yet" description="Be the first to start the conversation." />
      ) : (
        <div className="space-y-4">
          {comments.map(c => <CommentItem key={c.id} comment={c} campaignId={campaignId} />)}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="sm" variant="outline" disabled={!meta.hasPrev} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="font-display text-xs font-semibold text-slate-600 dark:text-slate-300 tnum">
            {page} / {meta.totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
