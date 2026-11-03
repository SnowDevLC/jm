import axios from "axios";

const { TIENDANUBE_STORE_ID, TIENDANUBE_ACCESS_TOKEN, TIENDANUBE_USER_AGENT } = process.env;
const TIENDANUBE_API_BASE = `https://api.tiendanube.com/2025-03/${TIENDANUBE_STORE_ID}`;

const tnHeaders = {
  Authentication: `bearer ${TIENDANUBE_ACCESS_TOKEN}`,
  "User-Agent": TIENDANUBE_USER_AGENT,
  "Content-Type": "application/json",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function TNfindProductBySKU(sku: string, retries = 5) {
  try {
    const res = await axios.get(`${TIENDANUBE_API_BASE}/products/sku/${sku}`, {
      headers: tnHeaders,
    });

    const product = res.data;
    if (!product || !product.variants?.length) return null;
    return { productId: product.id, variantId: product.variants[0].id };
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    if (error.response?.status === 429) {
      console.log(`⚠️ 429 Too Many Requests para ${sku}, esperando 5s...`);
      await sleep(5000);
      return TNfindProductBySKU(sku, retries - 1);
    }
    if (retries > 0) {
      console.log(`⚠️ Error al buscar SKU ${sku}, reintentando... (${retries} restantes)`);
      await sleep(1000);
      return TNfindProductBySKU(sku, retries - 1);
    }
    throw error;
  }
}

export async function TNupdateProduct(product: { productId: string; variantId: string }, data: any) {
  try {
    const bodyProduct: any = {};

    if (data.name !== undefined) {
      bodyProduct.name = { es: data.name };
    }
    if (data.isActiveShop !== undefined) {
      bodyProduct.published = data.isActiveShop;
    }
    if (Array.isArray(data.categories)) {
      const categoryIds = await TNFindCategories(data.categories);
      bodyProduct.categories = categoryIds;
    }

    if (Object.keys(bodyProduct).length > 0) {
      await axios.put(`${TIENDANUBE_API_BASE}/products/${product.productId}`, bodyProduct, { headers: tnHeaders });
    }

    const bodyVariant: any = {};

    if (data.price !== undefined) bodyVariant.price = data.price;
    if (data.cost !== undefined) bodyVariant.cost = data.cost;
    if (data.totalStock !== undefined) bodyVariant.stock = data.totalStock;

    if (Object.keys(bodyVariant).length > 0) {
      await axios.put(
        `${TIENDANUBE_API_BASE}/products/${product.productId}/variants/${product.variantId}`,
        bodyVariant,
        { headers: tnHeaders }
      );
    }
  } catch (error) {
    throw error;
  }
}

export async function TNcreateProduct(data: any) {
  try {
    const categoryIds = await TNFindCategories(data.categories);

    const body: any = {
      name: { es: data.name },
      categories: categoryIds,
      published: data.isActiveShop,
      variants: [
        {
          sku: data.SKU,
          price: data.price,
          cost: data.cost,
          stock: data.totalStock,
        },
      ],
    };

    const res = await axios.post(`${TIENDANUBE_API_BASE}/products`, body, {
      headers: tnHeaders,
    });
  } catch (error) {
    throw error;
  }
}

export async function TNFindCategories(categoriesNames: string[]) {
  try {
    const res = await axios.get(`${TIENDANUBE_API_BASE}/categories?fields=id,name`, {
      headers: tnHeaders,
    });

    const existingCategories = res.data as any[];
    const ids: number[] = [];

    for (const name of categoriesNames) {
      const found = existingCategories.find((cat) => cat.name?.es?.toLowerCase() === name.toLowerCase());

      if (found) {
        ids.push(found.id);
      } else {
        const created = await axios.post(
          `${TIENDANUBE_API_BASE}/categories`,
          { name: { es: name } },
          { headers: tnHeaders }
        );

        ids.push(created.data.id);
      }
    }

    return ids;
  } catch (error) {
    throw error;
  }
}

export async function TNupdateStockProduct(sku: string, stock: number) {
  try {
    const product = await TNfindProductBySKU(sku);
    if (!product) {
      return null;
    }

    const body = {
      action: "variation",
      value: stock,
      id: product.variantId,
    };

    const res = await axios.post(`${TIENDANUBE_API_BASE}/products/${product.productId}/variants/stock`, body, {
      headers: tnHeaders,
    });
  } catch (error) {
    throw error;
  }
}

export async function TNdeleteProduct(sku: string) {
  try {
    const product = await TNfindProductBySKU(sku);
    if (!product) {
      return null;
    }

    await axios.delete(`${TIENDANUBE_API_BASE}/products/${product.productId}`, {
      headers: tnHeaders,
    });
  } catch (error) {
    throw error;
  }
}
