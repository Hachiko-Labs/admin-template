import { redirect } from "next/navigation";

/** Default entry: send visitors into the primary dashboard shell. */
export default function HomePage() {
  redirect("/ecommerce/dashboard-1");
}
