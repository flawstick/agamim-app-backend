import { model, Schema, Document, Model } from "mongoose";

interface ICompanyBase {
  name: string;
  profile: { url: string; logo: string };
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  tenantId: string;
  restaurants: Schema.Types.ObjectId[];
  members?: Schema.Types.ObjectId[];
  coordinates?: { lat: number; lng: number };
  maxOrdersPerDay?: number;
  maxOrdersPerMonth?: number;
  maxPerOrder?: number;
  maxOrderShekels?: number;
  companyContributionPercentage?: number;
}

export interface ICompany extends ICompanyBase, Document {}
export interface ICompanyLean extends ICompanyBase {}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    profile: {
      url: { type: String, required: true },
      logo: { type: String, required: true },
    },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    tenantId: {
      type: String,
      required: true,
      description:
        "The ID of the tenant (company or factory) the company belongs to",
    },
    restaurants: [{ type: Schema.Types.ObjectId, ref: "restaurant" }],
    members: [{ type: Schema.Types.ObjectId, ref: "account" }],
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    maxOrdersPerDay: { type: Number },
    maxOrdersPerMonth: { type: Number },
    maxPerOrder: { type: Number },
    maxOrderShekels: { type: Number },
    companyContributionPercentage: { type: Number },
  },
  { timestamps: true, strict: false },
);

companySchema.index({ tenantId: 1 });

const CompanyModel: Model<ICompany> = model<ICompany>("company", companySchema);
export default CompanyModel;
