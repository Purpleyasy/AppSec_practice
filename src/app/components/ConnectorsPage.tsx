// Connectors page - manage GitHub integrations with sync and PAT management
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { AppShell } from "./AppShell";
import { TenantBadge } from "./TenantBadge";
import { StatusBadge } from "./StatusBadge";
import { Spinner } from "./Spinner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Pencil,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit,
  RotateCw,
  Trash2,
} from "lucide-react";
import { apiClient } from "../../lib/api";
import { Connector, Customer } from "../../lib/types";
import {
  getDeletedConnectorIds,
  addDeletedConnectorId,
} from "../../lib/deletedConnectors";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function ConnectorsPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(
    new Set(),
  );
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "error" | "info";
    }>
  >([]);

  // Create form state
  const [createForm, setCreateForm] = useState({
    type: "github",
    repoName: "",
    pat: "",
    branch: "main",
    basePath: "vaultsync",
  });

  // Delete form state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectorToDelete, setConnectorToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      const [connectorsResponse, customerResponse] =
        await Promise.all([
          apiClient.get<Connector[]>(`/customers/${customerId}/connectors`),
          apiClient.get<Customer>(`/customers/${customerId}`),
        ]);

      // Filter out soft-deleted connectors (single point of filtering)
      const deletedIds = getDeletedConnectorIds(
        customerId || "",
      );
      const filteredConnectors = (
        connectorsResponse || []
      ).filter(
        (connector) => !deletedIds.includes(connector.id),
      );

      setConnectors(filteredConnectors);
      setCustomer(customerResponse);
    } catch (error) {
      console.error("Failed to load connectors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnector = async () => {
    if (createForm.type !== "github") {
      toast.info(
        "Only GitHub connectors are supported in this demo",
      );
      return;
    }

    if (!createForm.repoName || !createForm.pat) {
      return;
    }

    try {
      const [owner, repo] = createForm.repoName.split("/");
      if (!owner || !repo) {
        toast.error("Repository must be in owner/repo format");
        return;
      }

      const newConnector = await apiClient.post<Connector>(
        `/customers/${customerId}/connectors`,
        {
          type: createForm.type,
          owner,
          repo,
          branch: createForm.branch,
          basePath: createForm.basePath,
          pat: createForm.pat,
        },
      );

      setConnectors((prev) => [...prev, newConnector]);
      setCreateModalOpen(false);
      setCreateForm({
        type: "github",
        repoName: "",
        pat: "",
        branch: "main",
        basePath: "vaultsync",
      });
      toast.success("Connector created successfully");
    } catch (error) {
      console.error("Failed to create connector:", error);
      toast.error("Failed to create connector");
    }
  };

  const handleSync = async (connectorId: string) => {
    setSyncingIds((prev) => new Set(prev).add(connectorId));

    try {
      // Call sync endpoint
      const response = await apiClient.post<{
        status: "success" | "failed";
        message: string;
      }>(`/customers/${customerId}/connectors/${connectorId}/sync`);

      // Check if backend indicates failure (even with HTTP 200)
      if (response.status === "failed") {
        // Add error notification to bell
        const errorNotification = {
          id: `sync-error-${Date.now()}`,
          message: response.message || "Sync failed",
          type: "error" as const,
        };
        setNotifications((prev) => [
          ...prev,
          errorNotification,
        ]);
        toast.error("Sync failed");
      } else {
        toast.success("Sync completed successfully");
      }

      // Reload connectors to get updated status
      await loadData();
    } catch (error) {
      const errorNotification = {
        id: `sync-error-${Date.now()}`,
        message:
          error instanceof Error
            ? error.message
            : "Sync request failed",
        type: "error" as const,
      };
      setNotifications((prev) => [...prev, errorNotification]);
      toast.error("Sync failed");
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(connectorId);
        return next;
      });
    }
  };

  const handleDeleteClick = (connectorId: string) => {
    setConnectorToDelete(connectorId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (connectorToDelete && customerId) {
      // Soft delete - persist in sessionStorage
      addDeletedConnectorId(customerId, connectorToDelete);
      toast.success("Connector deleted");
      setConnectors((prev) =>
        prev.filter((c) => c.id !== connectorToDelete),
      );
      setDeleteModalOpen(false);
      setConnectorToDelete(null);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const isCreateFormValid =
    createForm.type === "github" &&
    createForm.repoName &&
    createForm.pat;

  const maskPat = (patMasked?: string) => {
    if (!patMasked) return "********";
    return patMasked;
  };

  return (
    <AppShell
      notifications={notifications}
      onClearNotification={clearNotification}
    >
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <h1>Integrations</h1>
          </div>

          <Button variant="ghost" onClick={() => setCreateModalOpen(true)}>
            <Plus className="size-4 mr-2" />
            Configure
          </Button>
        </div>

        {/* Connectors table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead
              className="border-b border-border"
              style={{ backgroundColor: "#E2E5ED" }}
            >
              <tr style={{ color: "#2A3855" }}>
                <th className="text-left px-6 py-3 font-medium">
                  Repository
                </th>
                <th className="text-left px-6 py-3 font-medium">
                  Type
                </th>
                <th className="text-left px-6 py-3 font-medium">
                  PAT
                </th>
                <th className="text-left px-6 py-3 font-medium">
                  Last Sync
                </th>
                <th className="text-right px-6 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Loading connectors...
                  </td>
                </tr>
              ) : connectors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No connectors yet. Create your first
                    connector to get started.
                  </td>
                </tr>
              ) : (
                connectors.map((connector) => {
                  const isSyncing = syncingIds.has(
                    connector.id,
                  );

                  return (
                    <tr
                      key={connector.id}
                      className="border-b border-border hover:bg-muted/50 bg-white"
                      style={{ color: "#384D77" }}
                    >
                      <td className="px-6 py-4 font-mono text-sm">
                        {connector.repoName || connector.name || `${connector.owner}/${connector.repo}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-sm">
                          {connector.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {maskPat(connector.patMasked)}
                          </span>
                          <button className="p-1 hover:bg-accent rounded">
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {connector.lastSyncStatus && (
                            <StatusBadge
                              status={connector.lastSyncStatus}
                            />
                          )}
                          {connector.lastSyncAt && (
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(connector.lastSyncAt),
                                "MMM d, h:mm a",
                              )}
                            </p>
                          )}
                          {connector.lastSyncMessage && (
                            <p className="text-xs">
                              {connector.lastSyncMessage}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleSync(connector.id)
                            }
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <>
                                <Spinner
                                  size="sm"
                                  className="mr-2"
                                />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="size-4 mr-2" />
                                Sync
                              </>
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteClick(
                                    connector.id,
                                  )
                                }
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create connector modal */}
      <Dialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Connector</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Connector type */}
            <div className="space-y-2">
              <Label htmlFor="type">Connector Type</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="sharepoint">
                    SharePoint Online
                  </SelectItem>
                  <SelectItem value="powerbi">
                    Power BI
                  </SelectItem>
                  <SelectItem value="googledrive">
                    Google Drive
                  </SelectItem>
                  <SelectItem value="sap">SAP</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                  <SelectItem value="bitbucket">
                    Bitbucket
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic form based on type */}
            {createForm.type !== "github" ? (
              <div className="p-4 bg-muted rounded-md text-center text-muted-foreground">
                <p>Coming soon</p>
                <p className="text-xs mt-2">
                  This connector type is not yet available.
                </p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                  Using GitHub REST API (api.github.com)
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repoName">
                    Repository Name
                  </Label>
                  <Input
                    id="repoName"
                    value={createForm.repoName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        repoName: e.target.value,
                      }))
                    }
                    placeholder="owner/repo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: owner/repository (e.g.,
                    octocat/hello-world)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pat">
                    Personal Access Token (PAT)
                  </Label>
                  <Input
                    id="pat"
                    type="password"
                    value={createForm.pat}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        pat: e.target.value,
                      }))
                    }
                    placeholder="ghp_..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for authentication with GitHub API
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateConnector}
                disabled={!isCreateFormValid}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete connector modal */}
      <Dialog
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Connector</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this connector?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
