export const branches = [
  {
    id: 1,
    name: "Main Branch",
    location: "New York City, NY",
    status: "active",
  },
  {
    id: 2,
    name: "Downtown Branch",
    location: "Los Angeles, CA",
    status: "active",
  },
  { id: 3, name: "Uptown Branch", location: "Chicago, IL", status: "inactive" },
  { id: 4, name: "Suburban Branch", location: "Houston, TX", status: "active" },
  {
    id: 5,
    name: "Central Branch",
    location: "Phoenix, AZ",
    status: "inactive",
  },
];

export const inventoryData = [
  {
    id: 1,
    product_name: "Product A",
    branch_name: "Main Branch",
    stock_level: 100,
    expiry_date: "2023-12-31",
  },
  {
    id: 2,
    product_name: "Product B",
    branch_name: "Downtown Branch",
    stock_level: 50,
    expiry_date: "2023-11-30",
  },
  // ... (add more inventory data for different branches)
];

export const inventoryReportsData = [
  {
    id: 1,
    branch_id: 1,
    date_created: "2023-06-01",
    last_edit: "2023-06-01",
    status: "approved",
  },
  {
    id: 2,
    branch_id: 2,
    date_created: "2023-06-02",
    last_edit: "2023-06-03",
    status: "pending",
  },
  {
    id: 3,
    branch_id: 2,
    date_created: "2023-06-02",
    last_edit: "2023-06-03",
    status: "approved",
  },
  // ... (add more report data for different branches)
];
