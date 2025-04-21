
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes, Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

const NoteForm = ({ onSave, initial, loading }: {
  onSave: (note: { title: string; content: string }) => void;
  initial?: { title: string; content: string };
  loading?: boolean;
}) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) onSave({ title, content });
      }}
      className="space-y-2"
    >
      <Input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        disabled={loading}
      />
      <Textarea
        placeholder="Content"
        className="min-h-[100px]"
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" loading={loading}>
        Save
      </Button>
    </form>
  );
};

const NotesPage = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [editing, setEditing] = useState<null | Note>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data: notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote
  } = useNotes(userId);

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent>
            <p className="text-center py-12">You must be signed in to view your notes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Notes</CardTitle>
          <CardDescription>Store your notes securely</CardDescription>
        </CardHeader>
        <CardContent>
          {showForm && (
            <NoteForm
              onSave={data => {
                addNote.mutate(data, { onSuccess: () => setShowForm(false) });
              }}
              loading={addNote.isPending}
            />
          )}
          {!showForm && (
            <Button className="mb-4" onClick={() => setShowForm(true)}>
              New Note
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : notes && notes.length > 0 ? (
          notes.map((note: Note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(note)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this note?")) {
                          deleteNote.mutate(note.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {new Date(note.updated_at || note.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing?.id === note.id ? (
                  <NoteForm
                    onSave={data => {
                      updateNote.mutate({...note, ...data}, { onSuccess: () => setEditing(null) });
                    }}
                    initial={{ title: note.title, content: note.content }}
                    loading={updateNote.isPending}
                  />
                ) : (
                  <div className="whitespace-pre-line">{note.content}</div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">No notes yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
