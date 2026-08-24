import AppLayout from "@/components/layout/AppLayout";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[620px] px-4 py-24">
        <Result
          status="404"
          title="404"
          subTitle="Không tìm thấy trang bạn đang tìm."
          extra={
            <Button type="primary" className="note-btn-primary" href="/">
              Về trang chủ
            </Button>
          }
        />
      </div>
    </AppLayout>
  );
}