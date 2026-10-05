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
  CalendarClock,
  CreditCard,
  FileText,
  FolderKanban,
  GalleryVerticalEnd,
  GitBranch,
  Inbox,
  MessageSquareText,
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
      title: "AI Chat App",
      items: [
        {
          title: "Composers",
          icon: MessageSquareText,
          items: [
            { title: "Composer 1", url: "/ai-chat/composer-1" },
            { title: "Composer 2", url: "/ai-chat/composer-2" },
            { title: "Composer 3", url: "/ai-chat/composer-3" },
            { title: "Composer 4", url: "/ai-chat/composer-4" },
            { title: "Composer 5", url: "/ai-chat/composer-5" },
            { title: "Composer 6", url: "/ai-chat/composer-6" },
            { title: "Composer 7", url: "/ai-chat/composer-7" },
          ],
        },
        {
          title: "Conversations",
          icon: MessageSquareText,
          items: [
            { title: "Conversation 1", url: "/ai-chat/conversation-1" },
            { title: "Conversation 2", url: "/ai-chat/conversation-2" },
            { title: "Conversation 3", url: "/ai-chat/conversation-3" },
            { title: "Conversation 4", url: "/ai-chat/conversation-4" },
            { title: "Conversation 5", url: "/ai-chat/conversation-5" },
            { title: "Conversation 6", url: "/ai-chat/conversation-6" },
            { title: "Conversation 7", url: "/ai-chat/conversation-7" },
            { title: "Conversation 8", url: "/ai-chat/conversation-8" },
            { title: "Conversation 9", url: "/ai-chat/conversation-9" },
            { title: "Conversation 10", url: "/ai-chat/conversation-10" },
            { title: "Conversation 11", url: "/ai-chat/conversation-11" },
            { title: "Conversation 12", url: "/ai-chat/conversation-12" },
            { title: "Conversation 13", url: "/ai-chat/conversation-13" },
            { title: "Conversation 14", url: "/ai-chat/conversation-14" },
            { title: "Conversation 15", url: "/ai-chat/conversation-15" },
            { title: "Conversation 16", url: "/ai-chat/conversation-16" },
            { title: "Conversation 17", url: "/ai-chat/conversation-17" },
            { title: "Conversation 18", url: "/ai-chat/conversation-18" },
            { title: "Conversation 19", url: "/ai-chat/conversation-19" },
            { title: "Conversation 20", url: "/ai-chat/conversation-20" },
            {
              title: "Conversation 21",
              url: "/ai-chat/parent-child-conversations",
            },
            { title: "Conversation 22", url: "/ai-chat/web-answer" },
            {
              title: "Conversation 23",
              url: "/ai-chat/conversation-23",
            },
          ],
        },
        {
          title: "API Platform",
          icon: IconCode,
          items: [
            { title: "Profile", url: "/ai-chat/profile" },
            { title: "Model catalog", url: "/ai-chat/model-catalog" },
            { title: "Model details", url: "/ai-chat/model-detail" },
            { title: "Model pricing", url: "/ai-chat/model-pricing" },
            { title: "Model benchmarks", url: "/ai-chat/model-benchmarks" },
            { title: "API keys", url: "/ai-chat/api-keys" },
            { title: "Audio playground", url: "/ai-chat/audio-playground" },
            { title: "Plugins", url: "/ai-chat/plugins" },
            { title: "Billing", url: "/ai-chat/billing" },
            { title: "Credit usage", url: "/ai-chat/credit-usage" },
            { title: "Usage insights", url: "/ai-chat/usage-insights" },
            { title: "Model usage", url: "/ai-chat/model-usage" },
            { title: "API Requests", url: "/ai-chat/api-requests" },
            { title: "Batch jobs", url: "/ai-chat/batch-jobs" },
            { title: "Incidents", url: "/ai-chat/incidents" },
            { title: "Tokenizer", url: "/ai-chat/tokenizer" },
            { title: "Evaluations", url: "/ai-chat/evaluations" },
            { title: "Response review", url: "/ai-chat/response-review" },
            { title: "Project settings", url: "/ai-chat/project-settings" },
            {
              title: "Organization settings",
              url: "/ai-chat/organization-settings",
            },
          ],
        },
        {
          title: "Workflows",
          icon: GitBranch,
          items: [
            { title: "Workflow 1", url: "/ai-chat/workflow-1" },
            { title: "Workflow 2", url: "/ai-chat/workflow-2" },
            { title: "Workflow 3", url: "/ai-chat/workflow-3" },
          ],
        },
        {
          title: "Automations",
          icon: CalendarClock,
          items: [
            { title: "Automation 1", url: "/ai-chat/automation-1" },
            {
              title: "Automation 2",
              url: "/ai-chat/automation-run-history",
            },
          ],
        },
        {
          title: "Documents",
          icon: ReceiptText,
          items: [
            { title: "Document 1", url: "/ai-chat/pdf-evidence-chat" },
            {
              title: "Document 2",
              url: "/ai-chat/document-writing-workspace",
            },
            {
              title: "Document 3",
              url: "/ai-chat/artifact-version-review",
            },
            {
              title: "Document 4",
              url: "/ai-chat/deliverable-file-cabinet",
            },
            {
              title: "Document 5",
              url: "/ai-chat/document-comparison",
            },
            { title: "Document 6", url: "/ai-chat/knowledge-base" },
          ],
        },
        {
          title: "Research",
          icon: FolderKanban,
          items: [
            {
              title: "Research 1",
              url: "/ai-chat/research-brief-builder",
            },
            {
              title: "Evidence comparison matrix",
              url: "/ai-chat/evidence-comparison-matrix",
            },
          ],
        },
        {
          title: "Applications",
          icon: IconApps,
          items: [
            {
              title: "Visual inspection",
              url: "/ai-chat/visual-inspection",
            },
            {
              title: "Commerce copilot",
              url: "/ai-chat/embedded-commerce-copilot",
            },
            {
              title: "Mobile screen workspace",
              url: "/ai-chat/mobile-screen-workspace",
            },
            { title: "Video variations", url: "/ai-chat/creative-canvas" },
            { title: "YouTube content", url: "/ai-chat/generation-pipeline" },
          ],
        },
        {
          title: "Skills",
          icon: FileText,
          items: [
            { title: "Skill 1", url: "/ai-chat/skill-library" },
            { title: "Skills manager", url: "/ai-chat/skills-manager" },
          ],
        },
        {
          title: "Agents",
          icon: IconUsers,
          items: [
            { title: "Agent builder", url: "/ai-chat/agent-studio/builder" },
            {
              title: "Integrations",
              url: "/ai-chat/agent-studio/integrations",
            },
            { title: "Skills workspace", url: "/ai-chat/agent-studio/skills" },
            { title: "Agent 1", url: "/ai-chat/agent-activity" },
            { title: "Agent Factory 1", url: "/ai-chat/agent-factory-1" },
            { title: "Agent traces", url: "/ai-chat/agent-traces" },
            { title: "Agent workspace", url: "/ai-chat/agent-detail" },
            {
              title: "Agent configuration",
              url: "/ai-chat/agent-configuration",
            },
            { title: "Subagent canvas", url: "/ai-chat/canvas-workbench" },
            { title: "Mixed agent canvas", url: "/ai-chat/mixed-agent-canvas" },
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
