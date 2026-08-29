"use client";

import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Card, Col, DatePicker, Row, Statistic } from "antd";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { useVisits } from "@/hooks/use-api";
import styles from "./admin.module.scss";

interface DayVisit {
  day: number;
  visits: number;
}

/** Chỉ cho chọn tháng trong năm 2026 */
function disabledMonth(current: Dayjs): boolean {
  return current.isBefore("2026-01-01") || current.isAfter("2026-12-31");
}

const formatNumber = (n: number) => n.toLocaleString("vi-VN");

export default function AdminPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs("2026-08-01"));

  const monthKey = month.format("YYYY-MM");
  const visitsQuery = useVisits(monthKey);

  /* Dữ liệu biểu đồ */
  const data: DayVisit[] = useMemo(
    () => (visitsQuery.data?.days ?? []).map((d) => ({ day: d.day, visits: d.visits })),
    [visitsQuery.data]
  );
  const total = useMemo(() => data.reduce((sum, d) => sum + d.visits, 0), [data]);
  const peak = useMemo<DayVisit>(
    () => data.reduce((max, d) => (d && d.visits > (max?.visits ?? -1) ? d : max), data[0] ?? { day: 1, visits: 0 }),
    [data]
  );
  const avg = Math.round(total / (data.length || 1));

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.heading}>Tổng quan</h1>
              <p className={styles.sub}>Thống kê lượt truy cập hàng tháng</p>
            </div>
            <DatePicker
              picker="month"
              value={month}
              onChange={(value) => value && setMonth(value)}
              disabledDate={disabledMonth}
              allowClear={false}
              className={styles.monthFilter}
            />
          </div>

          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Tổng truy cập"
                value={formatNumber(total)}
                suffix="lượt"
                loading={visitsQuery.isPending}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Ngày cao nhất"
                value={formatNumber(peak.visits)}
                suffix={`(ngày ${peak.day})`}
                loading={visitsQuery.isPending}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Trung bình mỗi ngày"
                value={formatNumber(avg)}
                suffix="lượt"
                loading={visitsQuery.isPending}
              />
            </Col>
          </Row>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08131a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#08131a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#08131a14" />
                <XAxis dataKey="day" tickLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  tickLine={false}
                  fontSize={12}
                  width={44}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString("vi-VN")} lượt`,
                    "Truy cập",
                  ]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#08131a"
                  strokeWidth={2}
                  fill="url(#visitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
