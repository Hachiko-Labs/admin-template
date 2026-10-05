import { SubHeader } from "@/components/layout/sub-header";

const EC = "ecommerce";

const productOverrides = {
  "edit-product": "Edit Product",
  "edit-product-2": "Edit Product 2",
} as const;

interface Props {
  children: React.ReactNode;
}

export default function EcommerceProductsGroupLayout({ children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SubHeader
        section="Products"
        searchName="products-search"
        searchAriaLabel="Search products"
        sectionSegment={EC}
        breadcrumbOverrides={productOverrides}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
}
