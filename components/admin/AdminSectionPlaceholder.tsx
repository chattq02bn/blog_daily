import { Card, Empty } from "antd";

interface AdminSectionPlaceholderProps {
  title: string;
  description?: string;
}

export default function AdminSectionPlaceholder({
  title,
  description,
}: AdminSectionPlaceholderProps) {
  return (
    <div className="p-6">
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <p className="mb-1 font-bold text-text-primary">{title}</p>
              <p className="text-sm text-text-secondary">
                {description || `Tính năng ${title.toLowerCase()} đang được phát triển.`}
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
}