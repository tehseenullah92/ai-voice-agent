import { CampaignDetail } from "@/components/campaigns/campaign-detail";

type Props = { params: { id: string } };

export default function CampaignDetailPage({ params }: Props) {
  return <CampaignDetail campaignId={params.id} />;
}
