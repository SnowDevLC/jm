import HeaderCategories from "./components/HeaderCategories";
import ListCategories from "./components/ListCategories";
import { getCategories } from "./lib/dataCategories";

export default async function CategoriesPage() {

const categories = await getCategories();
  return (
    <div className="flex flex-col">
      <HeaderCategories />
      <ListCategories categories={categories} />
    </div>
  );
}