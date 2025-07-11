
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  ListTodo, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  Clock,
  AlertCircle,
  User
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmployeeProfile } from './EmployeeProfileForm';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'checklist' | 'event' | 'todo';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  dueDate?: Date;
  items?: ChecklistItem[];
}

interface AreaNotesManagerProps {
  areaCode: string;
  areaName: string;
  currentUser?: EmployeeProfile;
  employees: EmployeeProfile[];
}

const AreaNotesManager: React.FC<AreaNotesManagerProps> = ({ 
  areaCode, 
  areaName, 
  currentUser,
  employees 
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState('notes');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'checklist' | 'event' | 'todo'>('note');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`area-notes-${areaCode}`);
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          dueDate: note.dueDate ? new Date(note.dueDate) : undefined,
          items: note.items?.map((item: any) => ({
            ...item,
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined
          }))
        }));
        setNotes(parsed);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, [areaCode]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem(`area-notes-${areaCode}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setNoteType('note');
    setPriority('medium');
    setDueDate(undefined);
    setChecklistItems([]);
    setNewItemText('');
    setEditingNote(null);
  };

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      completed: false,
      priority: 'medium'
    };
    
    setChecklistItems(prev => [...prev, newItem]);
    setNewItemText('');
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleChecklistItem = (noteId: string, itemId: string) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId && note.items) {
        return {
          ...note,
          items: note.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date()
        };
      }
      return note;
    });
    saveNotes(updatedNotes);
  };

  const saveNote = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const now = new Date();
    const noteData: Note = {
      id: editingNote?.id || Date.now().toString(),
      title,
      content,
      type: noteType,
      priority,
      createdAt: editingNote?.createdAt || now,
      updatedAt: now,
      createdBy: currentUser?.name || 'Unknown',
      dueDate,
      items: noteType === 'checklist' || noteType === 'todo' ? checklistItems : undefined
    };

    let updatedNotes;
    if (editingNote) {
      updatedNotes = notes.map(note => note.id === editingNote.id ? noteData : note);
    } else {
      updatedNotes = [noteData, ...notes];
    }

    saveNotes(updatedNotes);
    resetForm();
    setShowDialog(false);
    toast.success(editingNote ? 'Note updated' : 'Note saved');
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.type);
    setPriority(note.priority);
    setDueDate(note.dueDate);
    setChecklistItems(note.items || []);
    setShowDialog(true);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    toast.success('Note deleted');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checklist': return <CheckSquare size={16} />;
      case 'event': return <CalendarIcon size={16} />;
      case 'todo': return <ListTodo size={16} />;
      default: return <StickyNote size={16} />;
    }
  };

  const filterNotesByTab = (tab: string) => {
    switch (tab) {
      case 'notes': return notes.filter(note => note.type === 'note');
      case 'checklists': return notes.filter(note => note.type === 'checklist');
      case 'events': return notes.filter(note => note.type === 'event');
      case 'todos': return notes.filter(note => note.type === 'todo');
      default: return notes;
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <StickyNote size={16} />
            <span>{areaName} - Notes & Planning</span>
            <Badge variant="secondary" className="text-xs">
              {notes.length}
            </Badge>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={resetForm}>
                <Plus size={14} className="mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNote ? 'Edit' : 'Create'} {noteType.charAt(0).toUpperCase() + noteType.slice(1)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="checklist">Checklist</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="todo">To-Do List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>

                {(noteType === 'event' || noteType === 'todo') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {(noteType === 'checklist' || noteType === 'todo') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Items</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          placeholder="Add new item..."
                          onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                        />
                        <Button onClick={addChecklistItem} size="sm">
                          <Plus size={14} />
                        </Button>
                      </div>
                      <ScrollArea className="max-h-32">
                        {checklistItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded mb-1">
                            <Checkbox 
                              checked={item.completed}
                              onCheckedChange={() => {
                                setChecklistItems(prev => 
                                  prev.map(i => i.id === item.id ? {...i, completed: !i.completed} : i)
                                );
                              }}
                            />
                            <span className={cn("flex-1 text-sm", item.completed && "line-through text-muted-foreground")}>
                              {item.text}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeChecklistItem(item.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={saveNote} className="flex-1">
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-3">
            <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            <TabsTrigger value="checklists" className="text-xs">Lists</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
            <TabsTrigger value="todos" className="text-xs">To-Do</TabsTrigger>
          </TabsList>

          {['notes', 'checklists', 'events', 'todos'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {filterNotesByTab(tab).length === 0 ? (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      No {tab} yet
                    </div>
                  ) : (
                    filterNotesByTab(tab).map((note) => (
                      <Card key={note.id} className="p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(note.type)}
                            <span className="font-medium text-sm">{note.title}</span>
                            <Badge variant="outline" className={cn("text-xs", getPriorityColor(note.priority))}>
                              {note.priority}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editNote(note)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNote(note.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                        
                        {note.content && (
                          <p className="text-xs text-muted-foreground mb-2">{note.content}</p>
                        )}
                        
                        {note.items && note.items.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {note.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <Checkbox 
                                  checked={item.completed}
                                  onCheckedChange={() => toggleChecklistItem(note.id, item.id)}
                                />
                                <span className={cn("text-xs", item.completed && "line-through text-muted-foreground")}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                            {note.items.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{note.items.length - 3} more items
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User size={10} />
                            <span>{note.createdBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {note.dueDate && (
                              <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{format(note.dueDate, 'MMM d')}</span>
                              </div>
                            )}
                            <span>{format(note.updatedAt, 'MMM d, HH:mm')}</span>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AreaNotesManager;
