"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api-config";
import { format } from "date-fns";
import { Download, Upload, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface AppVersion {
  id: number;
  version_name: string;
  version_code: number;
  apk_file_path: string;
  release_notes: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AppManagement() {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version_name: "",
    version_code: "1",
    release_notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latestVersionCode, setLatestVersionCode] = useState(0);

  const fetchVersions = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE_URL}/app-management/versions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch versions");
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      toast.error("Failed to fetch app versions");
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  useEffect(() => {
    if (versions.length > 0) {
      const highestCode = Math.max(...versions.map((v) => v.version_code));
      setLatestVersionCode(highestCode);
      setNewVersion((prev) => ({
        ...prev,
        version_code: String(highestCode + 1),
      }));
    } else {
      setNewVersion((prev) => ({
        ...prev,
        version_code: "1",
      }));
    }
  }, [versions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add version name validation
    const versionNamePattern = /^\d+\.\d+\.\d+$/;
    if (!versionNamePattern.test(newVersion.version_name)) {
      toast.error("Version name must be in format X.Y.Z (e.g., 1.0.0)");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select an APK file");
      return;
    }

    setIsUploading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const formData = new FormData();
      formData.append("apk_file", selectedFile);
      formData.append("version_name", newVersion.version_name);
      formData.append("version_code", newVersion.version_code);
      formData.append("release_notes", newVersion.release_notes);

      const response = await fetch(`${API_BASE_URL}/app-management/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      toast.success("APK uploaded successfully");
      fetchVersions();
      setNewVersion({ version_name: "", version_code: "", release_notes: "" });
      setSelectedFile(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload APK"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto space-y-6 p-4 md:p-6 lg:p-8">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">
              App Management
            </h2>
            <p className="text-muted-foreground">
              Manage mobile application versions and updates
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Version
                </CardTitle>
                <CardDescription>
                  Upload a new version of the mobile application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="version_name">Version Name</Label>
                    <Input
                      id="version_name"
                      placeholder="e.g., 1.0.0"
                      value={newVersion.version_name}
                      onChange={(e) =>
                        setNewVersion({
                          ...newVersion,
                          version_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version_code">Version Code</Label>
                    <Input
                      id="version_code"
                      type="number"
                      min={latestVersionCode + 1}
                      value={newVersion.version_code}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > latestVersionCode) {
                          setNewVersion({
                            ...newVersion,
                            version_code: e.target.value,
                          });
                        }
                      }}
                      required
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-incremented build number (current highest:{" "}
                      {latestVersionCode})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="release_notes">Release Notes</Label>
                    <Textarea
                      id="release_notes"
                      placeholder="What's new in this version?"
                      value={newVersion.release_notes}
                      onChange={(e) =>
                        setNewVersion({
                          ...newVersion,
                          release_notes: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apk_file">APK File</Label>
                    <Input
                      id="apk_file"
                      type="file"
                      accept=".apk"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Version
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Version History
                </CardTitle>
                <CardDescription>
                  View and manage application versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            v{version.version_name}
                            {version.is_active && (
                              <Badge variant="success" className="gap-1">
                                Active
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Released on{" "}
                            {format(
                              new Date(version.created_at),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`${API_BASE_URL}${version.apk_file_path}`}
                            download
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                      {version.release_notes && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {version.release_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
