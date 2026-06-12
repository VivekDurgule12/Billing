import React from "react";

export default function InvoiceTemplate({
  customerData,
  lineItems,
  totals,
  summary,
  invoiceNumber,
}) {
  const porterage = totals.porterage || 0;

  return (
    <div
      id="invoice-template"
      style={{
        width: "720px",
        background: "#fff",
        color: "#000",
        padding: "18px",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        boxSizing: "border-box",
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
                {new Date().toLocaleDateString()}
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
          {totals.totalWeight.toFixed(2)}
          {" | "}
          Total Items = {lineItems.length}
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
                  {index + 1}
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
                  ₹{item.rate.toFixed(2)}
                </td>

                <td
                  align="right"
                  style={{
                    padding: "6px",
                    borderBottom:
                      "1px solid #aaa",
                  }}
                >
                  ₹{item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <table
          style={{
            width: "40%",
            marginLeft: "auto",
            marginTop: "12px",
          }}
        >
          <tbody>
            <tr>
              <td align="right">
                <strong>SUB TOTAL</strong>
              </td>

              <td align="right">
                ₹{totals.subtotal.toFixed(2)}
              </td>
            </tr>

            {porterage > 0 && (
              <tr>
                <td align="right">
                  <strong>PORTAGE</strong>
                </td>

                <td align="right">
                  ₹{porterage.toFixed(2)}
                </td>
              </tr>
            )}

            {totals.discount > 0 && (
              <tr>
                <td align="right">
                  <strong>DISCOUNT</strong>
                </td>

                <td align="right">
                  ₹{totals.discount.toFixed(2)}
                </td>
              </tr>
            )}

            {summary.receivedAmount > 0 && (
              <tr>
                <td align="right">
                  <strong>RECEIVED</strong>
                </td>

                <td align="right">
                  ₹
                  {summary.receivedAmount.toFixed(
                    2
                  )}
                </td>
              </tr>
            )}

            {totals.payable > 0 &&
              summary.receivedAmount > 0 && (
                <tr>
                  <td align="right">
                    <strong>BALANCE</strong>
                  </td>

                  <td align="right">
                    ₹{totals.payable.toFixed(2)}
                  </td>
                </tr>
              )}
          </tbody>
        </table>

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
            ₹{totals.total.toFixed(2)}
          </span>
        </div>

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

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#666",
            fontSize: "11px",
          }}
        >
          Thank You For Your Business
          <br />
          DURGULE TRADERS
        </div>
      </div>
    </div>
  );
}