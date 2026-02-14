'use client';

import { useState } from 'react';
import { useTags, useManageTags } from '@/lib/hooks/useTags';
import { Plus, Trash2, Pencil, Loader2, X, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminTagsPage() {
  const { tags, loading, refetch } = useTags();
  const { addTag, deleteTag, updateTag } = useManageTags();
  const [newTagName, setNewTagName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTagName.trim()) return;
    setAdding(true);
    setError(null);
    const { success, error: err } = await addTag(newTagName);
    if (success) {
      setNewTagName('');
      refetch();
    } else {
      setError(err || 'Failed to add tag');
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { success, error: err } = await deleteTag(id);
    if (success) {
      refetch();
    } else {
      setError(err || 'Failed to delete tag');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    setError(null);
    const { success, error: err } = await updateTag(id, editingName);
    if (success) {
      setEditingId(null);
      setEditingName('');
      refetch();
    } else {
      setError(err || 'Failed to update tag');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Tags</h1>
          <p className="text-muted-foreground">
            Add, edit, or remove tags that schools can use when posting jobs.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Add new tag */}
        <div className="flex gap-2 mb-6">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter new tag name..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
          <Button onClick={handleAdd} disabled={adding || !newTagName.trim()}>
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add
          </Button>
        </div>

        {/* Tags list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Tag size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No tags yet. Add your first tag above.</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 px-4 py-3">
                {editingId === tag.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(tag.id); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-muted-foreground hover:bg-muted rounded"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-foreground">{tag.name}</span>
                    <button
                      onClick={() => { setEditingId(tag.id); setEditingName(tag.name); }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          {tags.length} tag{tags.length !== 1 ? 's' : ''} total
        </p>
      </div>
    </div>
  );
}
