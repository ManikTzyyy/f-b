import { supabase } from "@/lib/supabase";

const createSales = async ({ soDate, table, accountId }) => {
  const { data: config, error: configError } = await supabase
    .from("config_no")
    .select("id, count")
    .eq("ref", "so")
    .single();
  if (configError) throw configError;
  const nextCount = Number(config.count || 0) + 1;
  const { error: updateError } = await supabase
    .from("config_no")
    .update({ count: nextCount })
    .eq("id", config.id);
  if (updateError) throw updateError;

  const { data, error } = await supabase
    .from("sales_orders")
    .insert({
      so_no: `SO-${String(nextCount).padStart(5, "0")}`,
      so_date: soDate,
      table: table || null,
      account_id: accountId,
      total_amount: 0,
      status: "confirmed",
      progress: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

const createSalesItem = ({ data, soId }) => {
  const payload = data.map((item) => ({
    so_id: soId,
    menu_id: item.id,
    qty: item.qty,
    unit_price: item.unitPrice,
    sub_total: item,
    note: note?.trim() || null,
  }));
};

// javascript
// const createSalesItem = async ({ data, soId }) => {
//   try {
//     // Validasi data utama
//     if (!Array.isArray(data) || data.length === 0) {
//       throw new Error("Sales order items data is empty");
//     }

//     if (!soId) {
//       throw new Error("Sales order ID is required");
//     }

//     // Siapkan seluruh item sekaligus
//     const payload = data.map((item, index) => {
//       const quantity = item.quantity;
//       const unitPrice = item.unitPrice;
//       const menuId = item.id;
//       const note = item.note;

//       // Validasi input
//       if (!menuId) {
//         throw new Error(`Menu ID is required at item ${index + 1}`);
//       }

//       if (!Number.isSafeInteger(quantity) || quantity <= 0) {
//         throw new Error(`Invalid quantity at item ${index + 1}`);
//       }

//       if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
//         throw new Error(`Invalid unit price at item ${index + 1}`);
//       }

//       // Hitung subtotal
//       const subTotal = quantity * unitPrice;

//       if (!Number.isSafeInteger(subTotal)) {
//         throw new Error(
//           `Sales order item total is too large at item ${index + 1}`
//         );
//       }

//       // Bentuk data sesuai kolom database
//       return {
//         so_id: soId,
//         menu_id: menuId,
//         qty: quantity,
//         unit_price: unitPrice,
//         sub_total: subTotal,
//         note: note?.trim() || null,
//       };
//     });

//     // Bulk insert seluruh item dalam satu query
//     const { data: result, error } = await supabase
//       .from("sales_order_items")
//       .insert(payload)
//       .select();

//     if (error) {
//       throw error;
//     }

//     return result;
//   } catch (error) {
//     console.error("Failed to create sales order items:", error);
//     throw error;
//   }
// };


// **Cara memanggilnya:**

// javascript
// try {
//   const result = await createSalesItem({
//     soId: "uuid-sales-order",
//     data: [
//       {
//         id: "uuid-menu-1",
//         quantity: 2,
//         unitPrice: 15000,
//         note: "Cetak ulang",
//       },
//       {
//         id: "uuid-menu-2",
//         quantity: 3,
//         unitPrice: 20000,
//         note: "",
//       },
//     ],
//   });

//   console.log("Berhasil:", result);
// } catch (error) {
//   console.error("Gagal:", error.message);
// }
// ```

// ### Yang perlu diperhatikan

// - Pastikan nama kolom `so_id`, `menu_id`, `qty`, `unit_price`, `sub_total`, dan `note` sesuai dengan tabel Supabase kamu.
// - `item.id` diasumsikan merupakan ID menu yang disimpan ke `menu_id`.
// - Semua item memakai `soId` yang sama.
// - Jika satu item tidak valid, proses validasi berhenti sebelum query insert dijalankan.
// - Jika insert gagal karena constraint atau foreign key, error diteruskan ke pemanggil.
// - Bulk insert ini tidak otomatis menjamin transaksi mencakup operasi lain di luar query tersebut. Jika pembuatan sales order dan item harus berhasil atau gagal bersama-sama, gunakan transaksi melalui PostgreSQL function (RPC).
