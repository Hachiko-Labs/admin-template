import {
  IconApps,
  IconBarrierBlock,
  IconBox,
  IconBug,
  IconChecklist,
  IconCode,
  IconCoin,
  IconError404,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconNotification,
  IconServerOff,
  IconSettings,
  IconShoppingCart,
  IconTool,
  IconUser,
  IconUserOff,
  IconUsers,
} from "@tabler/icons-react";
import {
  AudioWaveform,
  CreditCard,
  FolderKanban,
  GalleryVerticalEnd,
  Inbox,
  ReceiptText,
  Repeat,
  Truck,
  UserRound,
  Webhook,
} from "lucide-react";

import { projects as todoProjects } from "@/app/(admin)/todo/data/data";
import { type SidebarData } from "@/components/layout/types";
import { Logo } from "@/components/logo";
import { site } from "@/data/site";
import {
  getProductEdit2Href,
  getProductEditHref,
} from "@/lib/ecommerce-edit-products";
import { todoRoutes } from "@/lib/todo-routes";

export const sidebarData: SidebarData = {
  user: {
    name: "ausrobdev",
    email: "rob@shadcnblocks.com",
    avatar: "/avatars/ausrobdev-avatar.png",
  },
  teams: [
    {
      name: site.title,
      logo: ({ className }: { className: string }) => (
        <Logo className={className} />
      ),
      plan: site.plan,
    },
    {
      name: "Northstar Ops",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Meridian Labs.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "Ecommerce",
      items: [
        {
          title: "Dashboard",
          icon: IconLayoutDashboard,
          items: [
            {
              title: "Dashboard 1",
              url: "/ecommerce/dashboard-1",
            },
            {
              title: "Dashboard 2",
              url: "/ecommerce/dashboard-2",
            },
            {
              title: "Dashboard 3",
              url: "/ecommerce/dashboard-3",
            },
            {
              title: "Dashboard 4",
              url: "/ecommerce/dashboard-4",
            },
            {
              title: "Dashboard 5",
              url: "/ecommerce/dashboard-5",
            },
            {
              title: "Dashboard 6",
              url: "/ecommerce/dashboard-6",
            },
            {
              title: "Dashboard 7",
              url: "/ecommerce/dashboard-7",
            },
            {
              title: "Dashboard 8",
              url: "/ecommerce/dashboard-8",
            },
            {
              title: "Dashboard 9",
              url: "/ecommerce/dashboard-9",
            },
          ],
        },
        {
          title: "Products",
          icon: IconBox,
          items: [
            {
              title: "Add Product",
              url: "/ecommerce/add-product",
            },
            {
              title: "Add Product 2",
              url: "/ecommerce/add-product-2",
            },
            {
              title: "Edit Product",
              url: getProductEditHref("Radiance Ritual Set"),
            },
            {
              title: "Edit Product 2",
              url: getProductEdit2Href("Radiance Ritual Set"),
            },
            {
              title: "Product Detail 1",
              url: "/ecommerce/product-detail-1",
            },
            {
              title: "Product Detail 2",
              url: "/ecommerce/product-detail-2",
            },
            {
              title: "Product List 1",
              url: "/ecommerce/product-list-1",
            },
            {
              title: "Product List 2",
              url: "/ecommerce/product-list-2",
            },
            {
              title: "Product List 3",
              url: "/ecommerce/product-list-3",
            },
            {
              title: "Product List 4",
              url: "/ecommerce/product-list-4",
            },
          ],
        },
        {
          title: "Orders",
          icon: IconShoppingCart,
          items: [
            {
              title: "Add New Order",
              url: "/ecommerce/add-order",
            },
            {
              title: "Edit Order",
              url: "/ecommerce/edit-order/so-654",
            },
            {
              title: "Order List 1",
              url: "/ecommerce/order-list-1",
            },
            {
              title: "Order List 2",
              url: "/ecommerce/order-list-2",
            },
            {
              title: "Order List 3",
              url: "/ecommerce/order-list-3",
            },
            {
              title: "Order Detail 1",
              url: "/ecommerce/order-detail-1",
            },
            {
              title: "Order Detail 2",
              url: "/ecommerce/order-detail-2",
            },
          ],
        },
        {
          title: "Customers",
          icon: IconUsers,
          items: [
            {
              title: "Add Customer",
              url: "/ecommerce/add-customer",
            },
            {
              title: "Edit Customer",
              url: "/ecommerce/edit-customer/cus-1742",
            },
            {
              title: "Customer List 1",
              url: "/ecommerce/customer-list-1",
            },
            {
              title: "Customer Detail 1",
              url: "/ecommerce/customer-detail-1",
            },
          ],
        },
        {
          title: "Shipments",
          icon: Truck,
          items: [
            {
              title: "Create Shipping Label",
              url: "/ecommerce/add-shipping",
            },
            {
              title: "Edit Shipping Label",
              url: "/ecommerce/edit-shipping",
            },
            {
              title: "Shipment List 1",
              url: "/ecommerce/shipment-list-1",
            },
            {
              title: "Shipment Detail 1",
              url: "/ecommerce/shipment-detail-1",
            },
          ],
        },
      ],
    },
    {
      title: "Project Management",
      items: [
        {
          title: "Dashboard",
          icon: IconLayoutDashboard,
          items: [
            {
              title: "Dashboard 1",
              url: "/project-management/dashboard-1",
            },
            {
              title: "Dashboard 2",
              url: "/project-management/dashboard-2",
            },
            {
              title: "Dashboard 3",
              url: "/project-management/dashboard-3",
            },
            {
              title: "Dashboard 4",
              url: "/project-management/dashboard-4",
            },
          ],
        },
        {
          title: "Projects",
          icon: FolderKanban,
          items: [
            {
              title: "Project List 1",
              url: "/project-management/project-list-1",
            },
            {
              title: "Project List 2",
              url: "/project-management/project-list-2",
            },
            {
              title: "Project List 3",
              url: "/project-management/project-list-3",
            },
            {
              title: "Project List 4",
              url: "/project-management/project-list-4",
            },
            {
              title: "Project Detail 1",
              url: "/project-management/project-detail-1",
            },
            {
              title: "Project Detail 2",
              url: "/project-management/project-detail-2",
            },
          ],
        },
        {
          title: "Teams",
          icon: IconUsers,
          items: [
            {
              title: "Team List 1",
              url: "/project-management/team-list-1",
            },
            {
              title: "Team List 2",
              url: "/project-management/team-list-2",
            },
            {
              title: "Team List 3",
              url: "/project-management/team-list-3",
            },
          ],
        },
        {
          title: "Members",
          icon: IconUser,
          items: [
            {
              title: "Member List 1",
              url: "/project-management/member-list-1",
            },
            {
              title: "Member List 2",
              url: "/project-management/member-list-2",
            },
            {
              title: "Member List 3",
              url: "/project-management/member-list-3",
            },
          ],
        },
        {
          title: "Issues",
          icon: IconChecklist,
          items: [
            {
              title: "Issue List 1",
              url: "/project-management/issue-list-1",
            },
            {
              title: "Issue List 2",
              url: "/project-management/issue-list-2",
            },
            {
              title: "Issue Calendar 1",
              url: "/project-management/issue-calendar-1",
            },
            {
              title: "Issue Calendar 2",
              url: "/project-management/issue-calendar-2",
            },
            {
              title: "Issue Detail 1",
              url: "/project-management/issue-detail-1",
            },
            {
              title: "Issue Detail 2",
              url: "/project-management/issue-detail-2",
            },
            {
              title: "Issue Kanban 1",
              url: "/project-management/issue-kanban-1",
            },
            {
              title: "Issue Kanban 2",
              url: "/project-management/issue-kanban-2",
            },
            {
              title: "Issue Kanban 3",
              url: "/project-management/issue-kanban-3",
            },
            {
              title: "Issue Gantt 1",
              url: "/project-management/issue-gantt-1",
            },
            {
              title: "Issue Spreadsheet 1",
              url: "/project-management/issue-spreadsheet-1",
            },
          ],
        },
        {
          title: "Inbox",
          icon: Inbox,
          items: [
            {
              title: "Inbox 1",
              url: "/project-management/inbox-1",
            },
            {
              title: "Inbox 2",
              url: "/project-management/inbox-2",
            },
            {
              title: "Inbox 3",
              url: "/project-management/inbox-3",
            },
            {
              title: "Inbox 4",
              url: "/project-management/inbox-4",
            },
            {
              title: "Inbox Email 1",
              url: "/project-management/inbox-email-1",
            },
          ],
        },
      ],
    },
    {
      title: "Payment Processor",
      items: [
        {
          title: "Dashboard",
          icon: IconLayoutDashboard,
          items: [
            {
              title: "Dashboard 1",
              url: "/payment-processor/dashboard-1",
            },
            {
              title: "Dashboard 2",
              url: "/payment-processor/dashboard-2",
            },
            {
              title: "Dashboard 3",
              url: "/payment-processor/dashboard-3",
            },
            {
              title: "Dashboard 4",
              url: "/payment-processor/dashboard-4",
            },
            {
              title: "Dashboard 5",
              url: "/payment-processor/dashboard-5",
            },
            {
              title: "Dashboard 6",
              url: "/payment-processor/dashboard-6",
            },
          ],
        },
        {
          title: "Transactions",
          icon: CreditCard,
          items: [
            {
              title: "Transactions",
              url: "/payment-processor/transactions",
            },
            {
              title: "Transactions List 2",
              url: "/payment-processor/transactions-list-2",
            },
            {
              title: "Transaction Detail",
              url: "/payment-processor/transaction-detail",
            },
            {
              title: "Transaction Detail 2",
              url: "/payment-processor/transaction-detail-2",
            },
          ],
        },
        {
          title: "Customers",
          icon: UserRound,
          items: [
            {
              title: "Customers",
              url: "/payment-processor/customers",
            },
            {
              title: "Customers List 2",
              url: "/payment-processor/customers-list-2",
            },
            {
              title: "Customer Detail",
              url: "/payment-processor/customer-detail",
            },
            {
              title: "Customer Detail 2",
              url: "/payment-processor/customer-detail-2",
            },
            {
              title: "Customer Detail 3",
              url: "/payment-processor/customer-detail-3",
            },
            {
              title: "Enterprise Client Detail",
              url: "/payment-processor/enterprise-client-detail",
            },
          ],
        },
        {
          title: "Subscriptions",
          icon: Repeat,
          items: [
            {
              title: "Subscriptions",
              url: "/payment-processor/subscriptions",
            },
            {
              title: "Subscriptions 2",
              url: "/payment-processor/subscriptions-2",
            },
            {
              title: "Subscriptions 3",
              url: "/payment-processor/subscriptions-3",
            },
            {
              title: "Subscriptions 4",
              url: "/payment-processor/subscriptions-4",
            },
            {
              title: "Create Subscription",
              url: "/payment-processor/create-subscription",
            },
            {
              title: "Subscription Detail",
              url: "/payment-processor/subscription-detail",
            },
          ],
        },
        {
          title: "Invoices",
          icon: ReceiptText,
          items: [
            {
              title: "Invoice List",
              url: "/payment-processor/invoice-list",
            },
            {
              title: "Invoice List 2",
              url: "/payment-processor/invoice-list-2",
            },
            {
              title: "Invoice List 3",
              url: "/payment-processor/invoice-list-3",
            },
            {
              title: "Invoice List 4",
              url: "/payment-processor/invoice-list-4",
            },
            {
              title: "Invoice List 5",
              url: "/payment-processor/invoice-list-5",
            },
            {
              title: "Create Invoice",
              url: "/payment-processor/create-invoice",
            },
            {
              title: "Create Invoice 2",
              url: "/payment-processor/create-invoice-2",
            },
            {
              title: "Create Invoice 3",
              url: "/payment-processor/create-invoice-3",
            },
            {
              title: "Invoice Detail",
              url: "/payment-processor/invoice-detail",
            },
            {
              title: "Invoice Detail 2",
              url: "/payment-processor/invoice-detail-2",
            },
            {
              title: "Invoice Detail 3",
              url: "/payment-processor/invoice-detail-3",
            },
          ],
        },
        {
          title: "Developers",
          icon: Webhook,
          items: [
            {
              title: "Webhooks",
              url: "/payment-processor/webhooks",
            },
            {
              title: "Payment Workflow",
              url: "/payment-processor/payment-workflow",
            },
            {
              title: "Delivery Simulator",
              url: "/payment-processor/delivery-simulator",
            },
          ],
        },
      ],
    },
    {
      title: "Todo",
      items: [
        {
          title: "Tasks",
          icon: IconChecklist,
          items: [
            { title: "All Tasks", url: todoRoutes.all },
            { title: "Create Task", url: todoRoutes.createTask },
            { title: "Today", url: todoRoutes.today },
            { title: "Upcoming", url: todoRoutes.upcoming },
            { title: "Important", url: todoRoutes.important },
          ],
        },
        {
          title: "Projects",
          icon: FolderKanban,
          items: todoProjects.map((project) => ({
            title: project.name,
            url: todoRoutes.project(project.id),
          })),
        },
        {
          title: "Manage",
          icon: IconSettings,
          items: [
            { title: "Activity", url: todoRoutes.activity },
            { title: "Settings", url: todoRoutes.settings },
            { title: "Trash", url: todoRoutes.deleted },
            { title: "Notifications", url: todoRoutes.notifications },
          ],
        },
      ],
    },
    {
      title: "Original",
      items: [
        {
          title: "Dashboard",
          icon: IconLayoutDashboard,
          items: [
            {
              title: "Dashboard 10",
              url: "/original/dashboard-10",
            },
            {
              title: "Dashboard 11",
              url: "/original/dashboard-11",
            },
            {
              title: "Dashboard 12",
              url: "/original/dashboard-12",
            },
          ],
        },
        {
          title: "Users",
          url: "/original/users",
          icon: IconUsers,
        },
        {
          title: "Tasks",
          url: "/original/tasks",
          icon: IconChecklist,
        },
        {
          title: "Settings",
          icon: IconSettings,
          items: [
            {
              title: "General",
              icon: IconTool,
              url: "/original/settings",
            },
            {
              title: "Profile",
              icon: IconUser,
              url: "/original/settings/profile",
            },
            {
              title: "Billing",
              icon: IconCoin,
              url: "/original/settings/billing",
            },
            {
              title: "Plans",
              icon: IconChecklist,
              url: "/original/settings/plans",
            },
            {
              title: "Connected Apps",
              icon: IconApps,
              url: "/original/settings/connected-apps",
            },
            {
              title: "Notifications",
              icon: IconNotification,
              url: "/original/settings/notifications",
            },
          ],
        },
      ],
    },
    {
      title: "Developers",
      items: [
        {
          title: "Dev Tools",
          icon: IconCode,
          items: [
            {
              title: "Overview",
              url: "/developers/overview",
            },
            {
              title: "API Keys",
              url: "/developers/api-keys",
            },
            {
              title: "Webhooks",
              url: "/developers/webhooks",
            },
            {
              title: "Events/Logs",
              url: "/developers/events-&-logs",
            },
          ],
        },
      ],
    },
    {
      title: "Pages",
      items: [
        {
          title: "Auth",
          icon: IconLockAccess,
          items: [
            {
              title: "Login",
              url: "/login",
            },
            {
              title: "Register",
              url: "/register",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
          ],
        },
        {
          title: "Errors",
          icon: IconBug,
          items: [
            {
              title: "Unauthorized",
              url: "/401",
              icon: IconLock,
            },
            {
              title: "Forbidden",
              url: "/403",
              icon: IconUserOff,
            },
            {
              title: "Not Found",
              url: "/404",
              icon: IconError404,
            },
            {
              title: "Internal Server Error",
              url: "/error",
              icon: IconServerOff,
            },
            {
              title: "Maintenance Error",
              url: "/503",
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
  ],
};
