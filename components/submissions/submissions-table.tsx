"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { Search, Filter } from "lucide-react";

interface Submission {
  id: string;
  title: string;
  status: string;
  youtube_url?: string;
  youtube_thumbnail?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    total_submissions?: number;
  };
}

export function SubmissionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", searchTerm, statusFilter, page],
    queryFn: async () => {
      let query = (supabase as any)
        .from("submissions")
        .select(
          `
          *,
          profiles (
            full_name,
            avatar_url,
            total_submissions
          )
        `
        )
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,youtube_url.ilike.%${searchTerm}%`
        );
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      return { submissions: (data || []) as Submission[], count: count || 0 };
    },
  });

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: "bg-gray-100 text-gray-800",
      edited: "bg-blue-100 text-blue-800",
      uploaded: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="edited">Edited</SelectItem>
              <SelectItem value="uploaded">Uploaded</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.submissions.map((submission: Submission) => (
              <TableRow key={submission.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {submission.youtube_thumbnail && (
                      <img
                        src={submission.youtube_thumbnail}
                        alt=""
                        className="w-12 h-8 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {submission.title}
                      </p>
                      {submission.youtube_url && (
                        <p className="text-sm text-gray-500 truncate">
                          {submission.youtube_url}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(submission.status)}
                    variant="secondary"
                  >
                    {submission.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={submission.profiles?.avatar_url} />
                      <AvatarFallback>
                        {submission.profiles?.full_name?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {submission.profiles?.full_name || "Unknown User"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {format(new Date(submission.created_at), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={`/submissions/${submission.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.count > pageSize && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Showing {page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, data.count)} of {data.count}{" "}
              submissions
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= data.count}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
