"use client";

import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import * as React from "react";

import {
  formatInvoiceMoney,
  type PdfTemplateProps,
} from "@/components/payment-processor/create-invoice-3-shared";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 0,
    paddingBottom: 30,
  },
  content: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 27,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
  },
  metaBlock: {
    gap: 2,
    marginBottom: 24,
  },
  metaRow: {
    alignItems: "baseline",
    flexDirection: "row",
    marginBottom: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: 700,
    width: 90,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 700,
  },
  mutedText: {
    color: "#6b7280",
    lineHeight: 1.35,
  },
  billColumns: {
    flexDirection: "row",
    marginBottom: 24,
  },
  sellerColumn: {
    marginRight: 70,
    width: 160,
  },
  buyerColumn: {
    width: 160,
  },
  smallBold: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
  },
  smallText: {
    fontSize: 9,
    marginBottom: 3,
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  table: {
    display: "flex",
    marginTop: 24,
    width: "100%",
  },
  tableHeader: {
    borderBottomColor: "#010000",
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 4,
    marginTop: 16,
    paddingBottom: 6,
  },
  tableHeaderText: {
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  colDescription: {
    flex: 3,
    textAlign: "left",
  },
  colQty: {
    flex: 0.45,
    marginRight: 16,
    textAlign: "right",
  },
  colUnitPrice: {
    flex: 1.2,
    textAlign: "right",
  },
  colTax: {
    flex: 0.8,
    textAlign: "right",
  },
  colAmount: {
    flex: 1.3,
    textAlign: "right",
  },
  itemName: {
    fontSize: 10,
  },
  itemDescription: {
    color: "#6b7280",
    fontSize: 9,
    marginTop: 4,
  },
  itemNumber: {
    color: "#111827",
    fontSize: 11,
  },
  totalsWrap: {
    alignItems: "flex-end",
    marginTop: 24,
  },
  totalsTable: {
    width: "50%",
  },
  totalRow: {
    borderTopColor: "#e5e7eb",
    borderTopWidth: 0.5,
    flexDirection: "row",
    paddingVertical: 2,
  },
  totalLabel: {
    flex: 3,
    fontSize: 9,
    paddingRight: 6,
  },
  totalValue: {
    flex: 1.3,
    fontSize: 9,
    textAlign: "right",
  },
  totalBold: {
    fontWeight: 700,
  },
  notes: {
    fontSize: 10,
    lineHeight: 1.35,
    marginTop: 24,
  },
  footer: {
    borderTopColor: "#e5e7eb",
    borderTopWidth: 0.5,
    bottom: 20,
    left: 30,
    paddingTop: 8,
    position: "absolute",
    right: 30,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    gap: 3,
  },
  footerText: {
    fontSize: 8,
  },
});

function formatDate(date: string) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function StripeMetaRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const weightStyle = strong ? { fontWeight: 700 } : { fontWeight: 500 };

  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaLabel, weightStyle]}>{label}</Text>
      <Text style={[styles.metaValue, weightStyle]}>{value}</Text>
    </View>
  );
}

function PdfInvoiceDocument({ invoice, totals }: PdfTemplateProps) {
  const formattedTotal = formatInvoiceMoney(
    invoice.currency,
    totals.total,
    true,
  );
  const dueDate = formatDate(invoice.dueDate);

  return (
    <Document title={`${invoice.invoiceNumber} invoice`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.invoiceTitle}>Invoice</Text>

          <View style={styles.metaBlock}>
            <StripeMetaRow
              label="Invoice number"
              value={invoice.invoiceNumber}
              strong
            />
            <StripeMetaRow
              label="Date of issue"
              value={formatDate(invoice.invoiceDate)}
            />
            <StripeMetaRow label="Date due" value={dueDate} />
          </View>

          <View style={styles.billColumns}>
            <View style={styles.sellerColumn}>
              <Text style={styles.smallBold}>{invoice.companyName}</Text>
              <Text style={styles.smallText}>{invoice.companyAddress}</Text>
              <Text style={styles.smallText}>{invoice.companyEmail}</Text>
            </View>

            <View style={styles.buyerColumn}>
              <Text style={styles.smallBold}>Bill to</Text>
              <Text style={styles.smallText}>{invoice.clientName}</Text>
              <Text style={styles.smallText}>{invoice.clientAddress}</Text>
              <Text style={styles.smallText}>{invoice.clientEmail}</Text>
            </View>
          </View>

          <Text style={styles.dueAmount}>
            {formattedTotal} due {dueDate}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <View style={styles.colDescription}>
                <Text style={styles.tableHeaderText}>Description</Text>
              </View>
              <View style={styles.colQty}>
                <Text style={styles.tableHeaderText}>Qty</Text>
              </View>
              <View style={styles.colUnitPrice}>
                <Text style={styles.tableHeaderText}>Unit price</Text>
              </View>
              <View style={styles.colTax}>
                <Text style={styles.tableHeaderText}>Tax</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tableHeaderText}>Amount</Text>
              </View>
            </View>

            {invoice.items.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.mutedText}>No invoice items added.</Text>
              </View>
            ) : (
              invoice.items.map((item) => (
                <View
                  key={item.id}
                  style={styles.tableRow}
                  wrap={false}
                  minPresenceAhead={60}
                >
                  <View style={styles.colDescription}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.colQty}>
                    <Text style={styles.itemNumber}>{item.quantity}</Text>
                  </View>
                  <View style={styles.colUnitPrice}>
                    <Text style={styles.itemNumber}>
                      {formatInvoiceMoney(invoice.currency, item.unitPrice)}
                    </Text>
                  </View>
                  <View style={styles.colTax}>
                    <Text style={styles.itemNumber}>{invoice.taxRate}%</Text>
                  </View>
                  <View style={styles.colAmount}>
                    <Text style={styles.itemNumber}>
                      {formatInvoiceMoney(
                        invoice.currency,
                        item.quantity * item.unitPrice,
                      )}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatInvoiceMoney(invoice.currency, totals.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total excluding tax</Text>
                <Text style={styles.totalValue}>
                  {formatInvoiceMoney(invoice.currency, totals.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tax ({invoice.taxRate}% on{" "}
                  {formatInvoiceMoney(invoice.currency, totals.subtotal)})
                </Text>
                <Text style={styles.totalValue}>
                  {formatInvoiceMoney(invoice.currency, totals.tax)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatInvoiceMoney(invoice.currency, totals.total)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.totalBold]}>
                  Amount due
                </Text>
                <Text style={[styles.totalValue, styles.totalBold]}>
                  {formattedTotal}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRow}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>
                {invoice.notes || "Created with shadcnblocks.com"}
              </Text>
            </View>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}

type PreviewActionState = {
  fileName: string;
  isRendering: boolean;
  url: string | null;
};

type PdfInvoicePreviewProps = PdfTemplateProps & {
  onPreviewActionChange?: (previewAction: PreviewActionState) => void;
};

export function PdfInvoicePreview({
  invoice,
  totals,
  onPreviewActionChange,
}: PdfInvoicePreviewProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = React.useState(true);
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const renderIdRef = React.useRef(0);
  const previewUrlRef = React.useRef<string | null>(null);

  // React PDF's mounted PDFViewer/PDFDownloadLink can crash during
  // Next 16/Turbopack Fast Refresh. Rendering to a Blob keeps dev stable;
  // pure PDF-template code edits may still need a browser reload to re-render.
  React.useEffect(() => {
    const renderId = renderIdRef.current + 1;
    renderIdRef.current = renderId;

    setRenderError(null);
    setIsRenderingPreview(true);

    const renderDelay = window.setTimeout(() => {
      void (async () => {
        try {
          const blob = await pdf(
            <PdfInvoiceDocument invoice={invoice} totals={totals} />,
          ).toBlob();
          const nextUrl = URL.createObjectURL(blob);

          if (renderIdRef.current !== renderId) {
            URL.revokeObjectURL(nextUrl);
            return;
          }

          setPreviewUrl((currentUrl) => {
            if (currentUrl) URL.revokeObjectURL(currentUrl);
            previewUrlRef.current = nextUrl;
            return nextUrl;
          });
        } catch (error) {
          if (renderIdRef.current !== renderId) return;

          console.warn("Failed to render invoice PDF preview.", error);
          setRenderError("PDF preview paused. Edit again or reload to retry.");
        } finally {
          if (renderIdRef.current === renderId) setIsRenderingPreview(false);
        }
      })();
    }, 650);

    return () => {
      window.clearTimeout(renderDelay);
    };
  }, [invoice, totals]);

  React.useEffect(() => {
    onPreviewActionChange?.({
      fileName: `${invoice.invoiceNumber || "invoice"}.pdf`,
      isRendering: isRenderingPreview,
      url: previewUrl,
    });
  }, [
    invoice.invoiceNumber,
    isRenderingPreview,
    onPreviewActionChange,
    previewUrl,
  ]);

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <section className="bg-muted/30 min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full min-h-[720px] min-w-0 flex-col">
        {previewUrl ? (
          <iframe
            src={`${previewUrl}#view=FitH&zoom=page-width`}
            title="Invoice PDF preview"
            className="min-h-0 w-full min-w-0 flex-1 border-0"
          />
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="text-muted-foreground text-sm">
              {renderError ?? "Preparing PDF preview..."}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
