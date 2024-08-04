import { model, Schema, Document, Model } from "mongoose";

interface ICompanyBase {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  tenantId: string;
  restaurants: Schema.Types.ObjectId[];
  members?: Schema.Types.ObjectId[];
  coordinates?: { lat: number; lng: number };
}

interface ICompany extends ICompanyBase, Document {}
export interface ICompanyLean extends ICompanyBase {}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
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
  },
  { timestamps: true },
);

companySchema.index({ tenantId: 1 });

const CompanyModel: Model<ICompany> = model<ICompany>("company", companySchema);
export default CompanyModel;
