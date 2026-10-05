import { SubHeader } from "@/components/layout/sub-header";

const EC = "ecommerce";

const orderOverrides = {
  "edit-order": "Edit Order",
  "order-detail-2": "Order detail 2",
} as const;

interface Props {
  children: React.ReactNode;
}

export default function EcommerceOrdersGroupLayout({ children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SubHeader
        section="Orders"
        searchName="orders-search"
        searchAriaLabel="Search orders"
        sectionSegment={EC}
        breadcrumbOverrides={orderOverrides}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
}
