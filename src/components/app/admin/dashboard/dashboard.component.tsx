import { useState, useEffect } from "react";
import { Breadcrumb } from "@/theme/bread-crumb/bread-crumb";
import { Spinner } from "@/theme/spinner/spinner";
import { apiService, commonService } from "@/services";
import { useNavigate } from "react-router-dom";
import { Paths } from "@/constants";
import {
  FiPackage,
  FiCheckCircle,
  FiLayers,
  FiAlertTriangle,
  FiXCircle,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { dashboardStatic } from "./dashboard.static";

interface DashboardData {
  counts: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    discontinuedProducts: number;
    totalCategories: number;
    lowStockCount: number;
  };
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
  }>;
  lowStockAlerts: Array<{
    productId: string;
    name: string;
    sku: string;
    imageUrl: string;
    stockQuantity: number;
    lowStockThreshold: number;
    status: string;
    categoryId: string;
    categoryName: string;
  }>;
}

export const DashboardComponent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    const apiName = "dashboardStats";
    try {
      const response = await apiService.GetAPICall(apiName);
      switch (response?.status) {
        case 1:
          commonService.resetAPIFlag(apiName, false);
          setDashboardData(response.data);
          setIsLoading(false);
          break;
        case 0:
          commonService.resetAPIFlag(apiName, false);
          setIsLoading(false);
          break;
      }
    } catch (error) {
      console.error("fetchDashboardStats error:", error);
      commonService.resetAPIFlag(apiName, false);
      setIsLoading(false);
    }
  };

  const getCardIcon = (colorType: string) => {
    switch (colorType) {
      case "blue":
        return <FiPackage className="text-xl text-white" />;
      case "emerald":
        return <FiCheckCircle className="text-xl text-white" />;
      case "purple":
        return <FiLayers className="text-xl text-white" />;
      case "amber":
        return <FiAlertTriangle className="text-xl text-white" />;
      case "rose":
        return <FiXCircle className="text-xl text-white" />;
      default:
        return <FiPackage className="text-xl text-white" />;
    }
  };

  const getCardIconBg = (colorType: string) => {
    switch (colorType) {
      case "blue":
        return "bg-blue-600 shadow-md shadow-blue-500/25";
      case "emerald":
        return "bg-emerald-600 shadow-md shadow-emerald-500/25";
      case "purple":
        return "bg-purple-600 shadow-md shadow-purple-500/25";
      case "amber":
        return "bg-amber-500 shadow-md shadow-amber-500/25";
      case "rose":
        return "bg-red-600 shadow-md shadow-red-500/25";
      default:
        return "bg-gray-700 shadow-md shadow-gray-500/25";
    }
  };

  const getStatusBadge = (status: string) => {
    const config = (dashboardStatic.statusColors as any)[status] || {
      label: status,
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${config.badgeClass}`}
      >
        {config.label}
      </span>
    );
  };

  const counts = dashboardData?.counts;
  const statusPieData = [
    { name: "Active", value: counts?.activeProducts || 0, color: "#10B981" },
    { name: "Inactive", value: counts?.inactiveProducts || 0, color: "#64748B" },
    { name: "Out of Stock", value: counts?.outOfStockProducts || 0, color: "#EF4444" },
    { name: "Discontinued", value: counts?.discontinuedProducts || 0, color: "#F59E0B" },
  ].filter((item) => item.value > 0);

  // Strictly Top 4 categories only, with horizontal clean names
  const categoryBarData = (dashboardData?.categoryDistribution || [])
    .slice(0, 4)
    .map((cat) => ({
      name: cat.categoryName,
      fullName: cat.categoryName,
      count: cat.productCount,
    }));

  // Custom tick to render category names straight (angle 0) across 1-2 lines
  const renderCategoryTick = (props: any) => {
    const { x, y, payload } = props;
    const name: string = payload?.value || "";
    const words = name.split(" ");
    let line1 = name;
    let line2 = "";

    if (name.length > 14 && words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(" ");
      line2 = words.slice(mid).join(" ");
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor="middle"
          fill="#374151"
          fontSize={11}
          fontWeight={600}
        >
          <tspan x={0} dy="0.8em">
            {line1.length > 16 ? `${line1.slice(0, 14)}...` : line1}
          </tspan>
          {line2 ? (
            <tspan x={0} dy="1.15em">
              {line2.length > 16 ? `${line2.slice(0, 14)}...` : line2}
            </tspan>
          ) : null}
        </text>
      </g>
    );
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumb
          items={[]}
          isRightButton={false}
          mainTitle="Dashboard"
          mainSubTitle="Real-time inventory overview & performance metrics"
        />
        <button
          onClick={fetchDashboardStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all shadow-xs hover:shadow cursor-pointer"
        >
          <FiRefreshCw className={`text-sm ${isLoading ? "animate-spin text-primary" : "text-gray-600"}`} />
          Refresh
        </button>
      </div>

      {isLoading && !dashboardData ? (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <Spinner />
          <span className="text-xs font-medium text-gray-500 mt-2">Loading dashboard metrics...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-5">
          {/* 1. TOP 5 KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardStatic.summaryCardsConfig.map((card) => {
              const countValue = (counts as any)?.[card.key] ?? 0;
              return (
                <div
                  key={card.key}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      {card.title}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCardIconBg(card.colorType)}`}
                    >
                      {getCardIcon(card.colorType)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {countValue}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{card.subTitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Donut Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Product Status Distribution
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Inventory active vs inactive breakdown
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                  {counts?.totalProducts || 0} Total
                </span>
              </div>

              {statusPieData.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-5">
                  <div className="w-full sm:w-1/2 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any) => [`${value} Products`, name]}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-1/2 flex flex-col gap-2.5">
                    {statusPieData.map((status) => {
                      const total = counts?.totalProducts || 1;
                      const percentage = Math.round((status.value / total) * 100);
                      return (
                        <div
                          key={status.name}
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-100/60 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: status.color }}
                            />
                            <span className="font-bold text-gray-800 text-xs">
                              {status.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-900 text-sm">
                              {status.value}
                            </span>
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${status.color}18`,
                                color: status.color,
                                border: `1px solid ${status.color}40`,
                              }}
                            >
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-52 text-xs text-gray-400 font-medium">
                  No products available for status distribution.
                </div>
              )}
            </div>

            {/* Top 4 Categories Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Products by Category
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Top 4 categories by volume</p>
                </div>
                <button
                  onClick={() => navigate(`/${Paths.admin}/${Paths.category}`)}
                  className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  View All <FiArrowRight className="text-xs" />
                </button>
              </div>

              {categoryBarData.length > 0 ? (
                <div className="h-56 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryBarData}
                      margin={{ top: 20, right: 15, left: -20, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="name"
                        tick={renderCategoryTick}
                        height={46}
                        interval={0}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: any, name: any, item: any) => [
                          `${value} Products`,
                          item?.payload?.fullName || "Category",
                        ]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={48}
                      >
                        {categoryBarData.map((_, index) => (
                          <Cell
                            key={`bar-${index}`}
                            fill={
                              dashboardStatic.barColors[
                                index % dashboardStatic.barColors.length
                              ]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-56 text-xs text-gray-400 font-medium">
                  No categories created yet.
                </div>
              )}
            </div>
          </div>

          {/* 3. LOW STOCK & REPLENISHMENT ALERTS TABLE */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
                  <FiAlertTriangle className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-900">
                      Low Stock & Depleted Inventory Alerts
                    </h3>
                    {(counts?.lowStockCount || 0) > 0 && (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-600 text-white shadow-xs">
                        {counts?.lowStockCount} Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Items with quantity at or below their alert threshold
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/${Paths.admin}/${Paths.product}`)}
                className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                Manage Products <FiArrowRight className="text-xs" />
              </button>
            </div>

            {(dashboardData?.lowStockAlerts || []).length > 0 ? (
              <div className="overflow-x-auto mt-4">
                <table className="w-full min-w-[650px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-center">Current Stock</th>
                      <th className="py-3 px-3 text-center">Threshold</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {dashboardData?.lowStockAlerts.map((item) => (
                      <tr
                        key={item.productId}
                        className="hover:bg-gray-50/80 transition-colors whitespace-nowrap"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FiPackage className="text-gray-400 text-lg" />
                              )}
                            </div>
                            <span className="font-bold text-gray-900 max-w-[220px] truncate">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs font-semibold text-gray-600">
                          {item.sku}
                        </td>
                        <td className="py-3 px-3 text-gray-700 font-medium">
                          {item.categoryName}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${
                              item.stockQuantity === 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {item.stockQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-700 font-semibold">
                          {item.lowStockThreshold}
                        </td>
                        <td className="py-3 px-3 text-center">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl mb-3 shadow-xs">
                  <FiCheckCircle />
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  Inventory is in Great Shape!
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  No products are currently at or below their low stock alert threshold.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
