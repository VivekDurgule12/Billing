import React from "react";

export default function InvoiceTemplate({
   customerData = {},
  lineItems = [],
  totals = {},
  summary = {},
  invoiceNumber,
  invoiceDate,
  pageLabel,
  totalItems,
  showSummary = true,
  startIndex = 0
}) {

  const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div
      id="invoice-template"
      style={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
    margin: 0,
    padding: "8px",
    boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      {/* HEADER */}
      <div id="pdf-header">
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            Durgule Traders
          </div>

          <div
            style={{
              textAlign: "right",
              fontSize: "12px",
            }}
          >
            9922019611, 8806821919
          </div>
        </div>

        <hr />
      </div>

      {/* BODY */}
      <div
  id="pdf-body"
  style={{
    pageBreakInside: "avoid",
    breakInside: "avoid",
  }}
>
        {/* Customer Details */}
        <table
          style={{
            width: "100%",
            marginBottom: "10px",
          }}
        >
          <tbody>
            <tr>
              <td>
                <strong>Name :</strong> {customerData.name}
              </td>

              <td align="right">
                <strong>Date :</strong>{" "}
                {new Date(invoiceDate || Date.now()).toLocaleDateString("en-IN")}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Contact :</strong>{" "}
                {customerData.mobile}
              </td>

              <td align="right">
                <strong>Invoice :</strong>{" "}
                INV-{invoiceNumber}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Address :</strong>{" "}
                {customerData.address}
              </td>

              <td></td>
            </tr>
            {customerData.orderId && <tr><td><strong>Order :</strong> {customerData.orderName || customerData.orderId}</td><td /></tr>}
          </tbody>
        </table>

        {/* Weight Summary */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            padding: "6px",
            marginBottom: "10px",
          }}
        >
          Total Weight ={" "}
          {Number(
  totals?.totalWeight || 0
).toFixed(2)}
          {" | "}
    Total Items = {
  totalItems ||
  lineItems.length
}
        </div>

        {/* Items Table */}
        <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    pageBreakInside: "avoid",
    breakInside: "avoid",
  }}
>
          <thead>
            <tr>
              {[
                ["10%", "Sr No"],
                ["45%", "Item Name"],
                ["15%", "Qty"],
                ["15%", "Rate"],
                ["15%", "Amount"],
                ["15%", "Weight"],
              ].map(([width, label]) => (
                <th
                  key={label}
                  width={width}
                  style={{
                    borderTop: "2px solid #444",
                    borderBottom: "2px solid #444",
                    padding: "6px",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {lineItems.map((item, index) => (
             <tr
  key={item.id}
  style={{
    fontWeight: "bold",
    fontSize: "18px",
    pageBreakInside: "avoid",
    breakInside: "avoid",
  }}
>
                <td
                  align="center"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
               {startIndex + index + 1}
                </td>

                <td
                  align="center"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
                  {item.name}
                </td>

                <td
                  align="center"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
                  {item.qty}
                </td>

                <td
                  align="right"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
                  {money(item.rate)}
                </td>

                <td
                  align="right"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
                  {money(item.amount)}
                </td>
                <td align="right" style={{ padding: "6px", borderBottom: "1px solid #aaa" }}>
                  {((Number(item.qty) || 0) * (Number(item.weightPerUnit) || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>





{/* Summary */}
{showSummary && (
  <table
    style={{
      width: "40%",
      marginLeft: "auto",
      marginTop: "12px",
    }}
  >
    <tbody>

      {/* SUB TOTAL - always show */}
      {Number(totals?.subtotal || 0) > 0 && (
        <tr>
          <td align="right">
            <strong>SUB TOTAL</strong>
          </td>
          <td align="right">
            {money(totals.subtotal)}
          </td>
        </tr>
      )}

      {/* PORTERAGE */}
      {Number(totals?.porterage || 0) > 0 && (
        <tr>
          <td align="right">
            <strong>PORTERAGE</strong>
          </td>
          <td align="right">
            {money(totals.porterage)}
          </td>
        </tr>
      )}

      {/* OLD BALANCE */}
      {Number(
        totals?.oldBalance ?? summary?.oldBalance ?? 0
      ) > 0 && (
        <tr>
          <td align="right">
            <strong>OLD BALANCE</strong>
          </td>
          <td align="right">
            {money(
              totals?.oldBalance ?? summary?.oldBalance
            )}
          </td>
        </tr>
      )}

      {/* DISCOUNT */}
      {Number(totals?.discount || 0) > 0 && (
        <tr>
          <td align="right">
            <strong>DISCOUNT</strong>
          </td>
          <td align="right">
            {money(totals.discount)}
          </td>
        </tr>
      )}

      {/* RECEIVED */}
      {Number(
        totals?.receivedAmount ??
        summary?.receivedAmount ??
        0
      ) > 0 && (
        <tr>
          <td align="right">
            <strong>RECEIVED</strong>
          </td>
          <td align="right">
            {money(
              totals?.receivedAmount ??
              summary?.receivedAmount
            )}
          </td>
        </tr>
      )}

      {/* AFTER DISCOUNT */}
      {Number(totals?.afterDiscount || 0) > 0 && (
        <tr>
          <td align="right">
            <strong>AFTER DISCOUNT</strong>
          </td>
          <td align="right">
            {money(totals.afterDiscount)}
          </td>
        </tr>
      )}

      {/* BALANCE */}
      {Number(totals?.payable || 0) > 0 && (
        <tr>
          <td align="right">
            <strong>BALANCE</strong>
          </td>
          <td align="right">
            {money(totals.payable)}
          </td>
        </tr>
      )}

    </tbody>
  </table>
)}



        {showSummary && <>
        {/* Grand Total */}
        <div
          style={{
           marginTop: "12px",
      borderTop: "3px solid #222",
      borderBottom: "3px solid #222",
      padding: "10px 0",
      display: "flex",
      justifyContent: "space-between",
      fontWeight: "bold",
      fontSize: "20px",
          }}
        >
          <span>GRAND TOTAL</span>

          <span>
            ₹{Number(
  totals?.total || 0
).toFixed(2)}
          </span>
        </div>
     {Number(totals?.totalProfit || 0) > 0 && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: "8px",
      fontWeight: "bold",
    }}
  >
 
  </div>
)}
        {/* Note */}
        {summary.note && (
          <div
            style={{
              marginTop: "10px",
            }}
          >
            <strong>Note :</strong>{" "}
            {summary.note}
          </div>
        )}
        </>}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#666",
            fontSize: "11px",
          }}
        >
          {pageLabel && <><strong>{pageLabel}</strong><br /></>}
          <div
  style={{
    textAlign: "center",
    marginTop: "15px",
    color: "#666",
    fontSize: "11px",
  }}
>
  <div>
    INV-{invoiceNumber}
    {" · "}
    {customerData.name || "Walk-in customer"}
    {customerData.orderName && (
      <>{" · "}{customerData.orderName}</>
    )}
    {" · "}
    {new Date(
      invoiceDate || Date.now()
    ).toLocaleDateString("en-IN")}
  </div>

  <div style={{ marginTop: "4px" }}>
    Thank You For Your Business
    {" · "}
    DURGULE TRADERS
  </div>
</div>
        </div>
      </div>
    </div>
  );
}
