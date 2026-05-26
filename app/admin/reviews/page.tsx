'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { deleteRow, listRows, saveRow } from '@/lib/admin/data';
import type { Review, WebsiteContent } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import ReviewForm from './components/ReviewForm';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const reviewsHiddenSectionKey = 'reviews_section_hidden';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const [data, status] = await Promise.all([
        listRows<Review>('reviews'),
        listRows<WebsiteContent>('website_content')
      ]);
      setReviews(data);
      setIsSectionVisible(!status.find((row) => row.section_key === reviewsHiddenSectionKey)?.is_active);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteRow('reviews', id);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review');
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleToggleSection = async (checked: boolean) => {
    try {
      setIsToggleLoading(true);
      const content = await listRows<WebsiteContent>('website_content');
      const existing = content.find((row) => row.section_key === reviewsHiddenSectionKey);
      await saveRow<WebsiteContent>('website_content', {
        id: existing?.id,
        section_key: reviewsHiddenSectionKey,
        is_active: !checked,
      });
      setIsSectionVisible(checked);
      window.dispatchEvent(new Event('kuhelika-public-data-change'));
      toast.success(checked ? 'Reviews section is now visible on the website' : 'Reviews section is now hidden from the website');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle section visibility');
    } finally {
      setIsToggleLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reviews</h1>
          <p className="text-slate-500 mt-1">Manage guest testimonials and reviews displayed on the website.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Switch
              id="section-visibility"
              checked={isSectionVisible}
              onCheckedChange={handleToggleSection}
              disabled={isToggleLoading}
            />
            <Label htmlFor="section-visibility" className="cursor-pointer font-medium">
              {isSectionVisible ? 'Section ON' : 'Section OFF'}
            </Label>
          </div>
          <Button onClick={handleAddNew} className="bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,25%)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-1/3">Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                  Loading reviews...
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                  {'No reviews found. Click "Add Review" to create one.'}
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[hsl(197,80%,30%)]">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{review.name}</div>
                        <div className="text-xs text-slate-500">{review.location}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {review.rating}
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600 line-clamp-2" title={review.review}>
                      {review.review}
                    </p>
                  </TableCell>
                  <TableCell>
                    {review.is_published ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Eye className="w-3 h-3 mr-1" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        <EyeOff className="w-3 h-3 mr-1" /> Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <ReviewForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          initialData={editingReview}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
}
