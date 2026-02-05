// Documents page with search, table, and upload modal
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AppShell } from './AppShell';
import { TenantBadge } from './TenantBadge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Search, Eye, Plus, ChevronDown, File, MoreVertical, Edit, Download, Trash2, Upload, Info } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Customer, DocumentDetail, DocumentSummary } from '../../lib/types';
import { format } from 'date-fns';

export function DocumentsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', content: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'error' | 'info' }>>([]);

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      const [docsResponse, customerResponse] = await Promise.all([
        apiClient.get<{ documents: DocumentSummary[] }>(`/customers/${customerId}/documents`),
        apiClient.get<Customer>(`/customers/${customerId}`),
      ]);

      setDocuments(docsResponse.documents || []);
      setCustomer(customerResponse);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    try {
      // WARNING: demo upload converts file -> text blob for storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;

        const newDoc = await apiClient.post<DocumentDetail>(
          `/customers/${customerId}/documents`,
          {
            title: selectedFile.name,
            content,
          },
        );

        // Append to list
        const summary: DocumentSummary = {
          id: newDoc.id,
          title: newDoc.title,
          updatedAt: newDoc.updatedAt,
          createdAt: newDoc.createdAt,
          lastModified: newDoc.lastModified,
          lastAccessed: newDoc.lastAccessed,
          modifiedBy: newDoc.modifiedBy,
          size: newDoc.size,
        };
        setDocuments(prev => [...prev, summary]);
        setUploadModalOpen(false);
        setSelectedFile(null);
        setFileError('');
      };
      reader.onerror = () => {
        alert('Failed to read file');
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // CHANGEABLE: accepted file types
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type - enterprise document formats
    const allowedTypes = ['.txt', '.md', '.json', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.pdf', '.csv', '.pbix'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setFileError(`Only ${allowedTypes.join(', ')} files are supported`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Read file contents and populate form
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      
      setUploadForm({
        name: nameWithoutExt,
        content: content,
      });
    };
    reader.onerror = () => {
      setFileError('Failed to read file');
      setSelectedFile(null);
    };
    reader.readAsText(file);
  };

  const handleModalClose = (open: boolean) => {
    setUploadModalOpen(open);
    if (!open) {
      // Reset form when modal closes
      setUploadForm({ name: '', content: '' });
      setSelectedFile(null);
      setFileError('');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppShell notifications={notifications} onClearNotification={clearNotification}>
      <div className="space-y-6">
        {/* Page header with tenant badge */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h1>Documents</h1>
          </div>

          {/* "+ Add" dropdown button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                <Plus className="size-4" />
                Add
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setUploadModalOpen(true)}>
                Upload
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setUploadModalOpen(true)}>
                Create
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Documents table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border" style={{ backgroundColor: '#E2E5ED' }}>
              <tr style={{ color: '#2A3855' }}>
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-6 py-3 font-medium">
                  <div className="flex items-center gap-3">
                    <File className="size-5" />
                    <span>Name</span>
                  </div>
                </th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-left px-6 py-3 font-medium">Created</th>
                <th className="text-left px-6 py-3 font-medium">Last Modified</th>
                <th className="text-left px-6 py-3 font-medium">Last Accessed</th>
                <th className="text-left px-6 py-3 font-medium">Modified By</th>
                <th className="text-right px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    {searchQuery ? 'No documents match your search' : 'No documents yet'}
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/50 bg-white" style={{ color: '#384D77' }}>
                    <td className="w-12 px-4 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <span>{doc.title}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {doc.title.includes('.') ? doc.title.split('.').pop()?.toUpperCase() : '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {format(new Date(doc.createdAt || doc.updatedAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {format(new Date(doc.lastModified || doc.updatedAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {format(new Date(doc.lastAccessed || doc.updatedAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {doc.modifiedBy || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/customers/${customerId}/documents/${doc.id}`}>
                            <Eye className="size-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem title="Placeholder action">
                              <Edit className="size-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem title="Placeholder action">
                              <Download className="size-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem title="Placeholder action" className="text-destructive">
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload modal */}
      <Dialog open={uploadModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>Upload Document</DialogTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Supports: .txt, .md, .json, .docx, .doc, .xlsx, .xls, .pptx, .ppt, .pdf, .csv, .pbix
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {/* Modern file drop zone */}
            <label
              htmlFor="file-upload"
              className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="size-12 text-muted-foreground mb-4" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                  </div>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".txt,.md,.json,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.pdf,.csv,.pbix"
                onChange={handleFileSelect}
              />
            </label>
            {fileError && (
              <p className="text-xs text-destructive mt-2">
                {fileError}
              </p>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" onClick={() => handleModalClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
