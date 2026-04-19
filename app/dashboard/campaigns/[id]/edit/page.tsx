import { CampaignEditForm } from "@/components/campaigns/campaign-edit-form";

type Props = { params: { id: string } };

export default function EditCampaignPage({ params }: Props) {
  return <CampaignEditForm campaignId={params.id} />;
}
