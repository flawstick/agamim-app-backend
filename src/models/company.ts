import { model, Schema, Document, Model } from "mongoose";

interface ICompanyBase {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  tenantId: string;
  restaurants: Schema.Types.ObjectId[]; // List of restaurant references
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
  },
  { timestamps: true },
);

companySchema.index({ tenantId: 1 });

const CompanyModel: Model<ICompany> = model<ICompany>("company", companySchema);
export default CompanyModel;
