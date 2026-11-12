import type { ReactNode } from "react";
import { ACQUISITION_SOURCE_LABELS } from "@/app/lib/acquisition";
import type { SalesReport } from "@/app/lib/reporting/salesReport";
import { formatCount, formatDateTime } from "./format";
import { StatusBadge } from "./StatusBadge";

/*
 * Listes détaillées : une grille par ligne, en-têtes visibles à partir de md.
 * Sur mobile chaque ligne devient une fiche empilée, sans scroll horizontal.
 */

export function Panel({ title, description, children, className = "" }: { title: string; description?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`min-w-0 rounded-lg border border-solid border-neutral-300 bg-neutral-100 p-4 sm:p-5 ${className}`}>
            <header className="mb-4">
                <h2 className="mb-0 text-lg font-semibold text-neutral-800">{title}</h2>
                {description ? <p className="mb-0 mt-1 text-sm text-neutral-600">{description}</p> : null}
            </header>
            {children}
        </section>
    );
}

function Empty({ children }: { children: ReactNode }) {
    return <p className="mb-0 text-sm text-neutral-600">{children}</p>;
}

function HeaderRow({ columns, grid }: { columns: string[]; grid: string }) {
    return (
        <div aria-hidden className={`hidden border-b border-solid border-neutral-300 pb-2 text-xs font-medium text-neutral-600 md:grid ${grid}`}>
            {columns.map((column) => (
                <span key={column} className={column.startsWith(">") ? "text-right" : undefined}>
                    {column.replace(/^>/, "")}
                </span>
            ))}
        </div>
    );
}

/** Libellé visible uniquement sur mobile, à la place de l'en-tête de colonne. */
function CellLabel({ children }: { children: ReactNode }) {
    return <span className="text-xs text-neutral-600 md:hidden">{children} </span>;
}

export function ProductsTable({ products }: { products: SalesReport["products"] }) {
    return (
        <Panel title="Produits numériques" description="Quantités vendues pendant la période.">
            {products.length === 0 ? (
                <Empty>Aucun achat numérique sur cette période.</Empty>
            ) : (
                <table className="w-full table-fixed text-sm">
                    <thead>
                        <tr className="border-b border-solid border-neutral-300 text-left text-xs font-medium text-neutral-600">
                            <th className="pb-2 font-medium">Produit</th>
                            <th className="w-16 pb-2 text-right font-medium sm:w-24">Achats</th>
                            <th className="w-16 pb-2 text-right font-medium sm:w-24">Quantité</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.referenceKey} className="border-b border-solid border-neutral-300 last:border-0">
                                <td className="break-words py-2 pr-2 font-medium text-neutral-800">{product.label}</td>
                                <td className="py-2 text-right tabular-nums">{formatCount(product.purchases)}</td>
                                <td className="py-2 text-right font-semibold tabular-nums">{formatCount(product.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Panel>
    );
}

const CUSTOMER_GRID = "md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,2fr)] md:gap-4";

export function CustomersTable({ customers }: { customers: SalesReport["customers"] }) {
    return (
        <Panel title="Clients et ordre des achats" description="Séquence complète connue, pas seulement les achats de la période.">
            {customers.length === 0 ? (
                <Empty>Aucun client sur cette période.</Empty>
            ) : (
                <div className="text-sm">
                    <HeaderRow grid={CUSTOMER_GRID} columns={["Client", "Source initiale", "Achats dans l'ordre"]} />
                    <ul className="m-0 list-none p-0">
                        {customers.map((customer) => (
                            <li key={customer.email} className={`grid gap-1 border-b border-solid border-neutral-300 py-3 last:border-0 ${CUSTOMER_GRID}`}>
                                <div className="min-w-0">
                                    <p className="mb-0 font-medium text-neutral-800">{customer.name}</p>
                                    <p className="mb-0 break-all text-xs text-neutral-600">{customer.email}</p>
                                </div>
                                <p className="mb-0">
                                    <CellLabel>Source :</CellLabel>
                                    {ACQUISITION_SOURCE_LABELS[customer.source]}
                                </p>
                                <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
                                    {customer.sequence.length === 0 ? (
                                        <li className="text-neutral-600">-</li>
                                    ) : (
                                        customer.sequence.map((item, index) => (
                                            <li key={`${item}-${index}`} className="flex items-center gap-1">
                                                {index > 0 ? (
                                                    <span aria-hidden className="text-neutral-500">
                                                        ›
                                                    </span>
                                                ) : null}
                                                <span className="rounded bg-neutral-300/60 px-1.5 py-0.5 text-xs text-neutral-800">{item}</span>
                                            </li>
                                        ))
                                    )}
                                </ol>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Panel>
    );
}

const CALENDLY_GRID = "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] md:gap-4";

export function CalendlyTable({ calendly }: { calendly: SalesReport["calendly"] }) {
    return (
        <Panel title="Demandes commerciales Calendly" description="Entretiens gratuits « Your FIDE Plan » réservés pendant la période.">
            {calendly.status !== "available" ? (
                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                    <StatusBadge state={calendly.status} />
                    {calendly.message}
                </div>
            ) : calendly.leads.length === 0 ? (
                <Empty>Aucune demande commerciale sur cette période.</Empty>
            ) : (
                <div className="text-sm">
                    <HeaderRow grid={CALENDLY_GRID} columns={["Demande", "Rendez-vous", "Personne", "Source", "Bouton"]} />
                    <ul className="m-0 list-none p-0">
                        {calendly.leads.map((lead) => (
                            <li key={lead.eventUri} className={`grid gap-1 border-b border-solid border-neutral-300 py-3 last:border-0 ${CALENDLY_GRID}`}>
                                <p className="mb-0 tabular-nums">
                                    <CellLabel>Demande :</CellLabel>
                                    {formatDateTime(lead.createdAt)}
                                </p>
                                <p className="mb-0 tabular-nums">
                                    <CellLabel>Rendez-vous :</CellLabel>
                                    {formatDateTime(lead.scheduledAt)}
                                </p>
                                <div className="min-w-0 max-md:order-first">
                                    <p className="mb-0 font-medium text-neutral-800">{lead.name}</p>
                                    <p className="mb-0 break-all text-xs text-neutral-600">{lead.email}</p>
                                </div>
                                <p className="mb-0">
                                    <CellLabel>Source :</CellLabel>
                                    {ACQUISITION_SOURCE_LABELS[lead.source]}
                                </p>
                                <p className="mb-0 break-words">
                                    <CellLabel>Bouton :</CellLabel>
                                    {lead.placement || "-"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Panel>
    );
}

export function PrivateLessonsDetails({ privateLessons }: { privateLessons: SalesReport["privateLessons"] }) {
    return (
        <details className="group rounded-lg border border-solid border-neutral-300 bg-neutral-100 p-4 sm:p-5">
            <summary className="cursor-pointer text-base font-semibold text-neutral-800">Cours privés ({formatCount(privateLessons.purchaseCount)} achats)</summary>
            <p className="mb-4 mt-2 text-sm text-neutral-600">Sources uniquement : aucun montant n&apos;est affiché ni inclus dans les chiffres financiers.</p>
            {privateLessons.purchaseCount === 0 ? (
                <Empty>Aucun cours privé sur cette période.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-6 text-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                    <ul className="m-0 list-none p-0">
                        {privateLessons.sources.map((row) => (
                            <li key={row.source} className="flex justify-between border-b border-solid border-neutral-300 py-2 last:border-0">
                                <span>{row.label}</span>
                                <span className="font-semibold tabular-nums">{formatCount(row.count)}</span>
                            </li>
                        ))}
                    </ul>
                    <ul className="m-0 list-none p-0">
                        {privateLessons.customers.map((customer) => (
                            <li key={customer.email} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-solid border-neutral-300 py-2 last:border-0">
                                <span className="min-w-0">
                                    <span className="font-medium text-neutral-800">{customer.name}</span>{" "}
                                    <span className="break-all text-xs text-neutral-600">{customer.email}</span>
                                </span>
                                <span className="text-neutral-700">{ACQUISITION_SOURCE_LABELS[customer.source]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </details>
    );
}
