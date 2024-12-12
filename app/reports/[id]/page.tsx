"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api-config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) throw new Error("No auth token");

        const res = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.INVENTORY.GET(parseInt(params.id))}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        router.push("/reports");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-muted/40">
        <SideNavBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-muted/40 print:hidden">
        <SideNavBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Inventory Report #{params.id}
              </h1>
            </div>
            <div className="flex items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Report #{params.id}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            <ReportContent report={report} params={params} />
          </main>
        </div>
      </div>

      <div className="hidden print:block print:m-4">
        <ReportContent report={report} params={params} />
      </div>
    </>
  );
}

function ReportContent({
  report,
  params,
}: {
  report: any;
  params: { id: string };
}) {
  const formatPeriodDate = (date: Date) => {
    const dayAndTime = format(date, "EEE, MMM d");
    const time = format(date, "h:mm a");
    return (
      <div className="flex flex-col">
        <span className="font-medium">{dayAndTime}</span>
        <span className="text-sm text-muted-foreground">{time}</span>
      </div>
    );
  };

  return (
    <>
      {/* Regular view */}
      <div className="print:hidden">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Inventory Report Details</CardTitle>
            <CardDescription>
              Detailed information about inventory report #{params.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{report.branch_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Report Date</p>
                <p className="font-medium">
                  {format(new Date(report.created_at), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <div className="flex items-center gap-2">
                  {formatPeriodDate(new Date(report.start_date))}
                  <span className="text-muted-foreground">to</span>
                  {formatPeriodDate(new Date(report.end_date))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Items Count</p>
                <p className="font-medium">{report.items_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Items</CardTitle>
            <CardDescription>
              List of all items in this inventory report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={report.items}
              enableSorting
              enableFiltering
              enableColumnVisibility
              filterColumn="product_name"
              filterPlaceholder="Search by product name..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Print view */}
      <div className="hidden print:block">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Inventory Report #{params.id}</h1>
          <div className="mt-2">
            <p>Branch: {report.branch_name}</p>
            <p>Report Date: {format(new Date(report.created_at), "PPP")}</p>
            <p>
              Period:{" "}
              {format(new Date(report.start_date), "EEE, MMM d, h:mm a")} to{" "}
              {format(new Date(report.end_date), "EEE, MMM d, h:mm a, yyyy")}
            </p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Product Name</th>
              <th className="text-right p-2">SRP</th>
              <th className="text-right p-2">Beginning</th>
              <th className="text-right p-2">Deliveries</th>
              <th className="text-right p-2">Transfers</th>
              <th className="text-right p-2">Pull Outs</th>
              <th className="text-right p-2">Offtake</th>
              <th className="text-right p-2">Selling Area</th>
              <th className="text-right p-2">Peso Value</th>
            </tr>
          </thead>
          <tbody>
            {report.items.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.product_name}</td>
                <td className="text-right p-2">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(item.current_srp)}
                </td>
                <td className="text-right p-2">{item.beginning}</td>
                <td className="text-right p-2">{item.deliver}</td>
                <td className="text-right p-2">{item.transfer}</td>
                <td className="text-right p-2">{item.pull_out}</td>
                <td className="text-right p-2">{item.offtake}</td>
                <td className="text-right p-2">{item.selling_area}</td>
                <td className="text-right p-2">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(item.peso_value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
