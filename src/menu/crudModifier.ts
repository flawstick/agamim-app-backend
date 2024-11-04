import { IAddition, IModifier, ModifierModel } from "@/models/menu";
import { Types } from "mongoose";

// *
// Add a modifier to the menu
// @param modifier - the modifier to add
// *
export const addModifier = async (modifier: any) => {
  const sanitizedModifier = sanitizeModifier(modifier);
  const newModifier = new ModifierModel(sanitizedModifier);
  return newModifier.save();
};

// *
// PUT - Update a Modifier
// @param modifierId - the modifier to Update
// @param modifier - the modifier data
// *
export const updateModifier = async (modifierId: string, modifier: any) => {
  const sanitizedModifier = sanitizeModifier(modifier);
  return ModifierModel.findByIdAndUpdate(modifierId, sanitizedModifier, {
    new: true,
  });
};

// *
// DELETE - Remove a ModifierModel
// @param modifierId - the modifier to Remove
// *
export const removeModifier = async (modifierId: string) => {
  return ModifierModel.findByIdAndDelete(modifierId);
};

// *
// GET - Get a Modifier
// @param modifierId - the modifier to Get
// *
export const getModifier = async (modifierId: string) => {
  return ModifierModel.findById(modifierId);
};

// *
// Make all illegal values unrepresentable
// Make sure DOP standards are followed
// @param modifier - the modifier to add
// *
export const sanitizeModifier = (modifier: IModifier): IModifier => {
  const sanitizeAddition = (addition: IAddition): IAddition => {
    return {
      name: typeof addition.name === "string" ? addition.name : "Unnamed",
      price:
        typeof addition.price === "number" && addition.price >= 0
          ? addition.price
          : 0,
      multiple: addition.multiple ?? false,
      max: addition.max && addition.max > 0 ? addition.max : undefined,
      indexDaysAvailable: Array.isArray(addition.indexDaysAvailable)
        ? addition.indexDaysAvailable.filter((day) => day >= 0 && day <= 6)
        : [],
      spiceLevel:
        typeof addition.spiceLevel === "number" &&
        addition.spiceLevel >= 0 &&
        addition.spiceLevel <= 5
          ? addition.spiceLevel
          : 0, // default spice level to 0 if out of range or invalid
      vegan: typeof addition.vegan === "boolean" ? addition.vegan : false,
    };
  };

  return {
    restaurantId:
      typeof modifier?.restaurantId === "string"
        ? (new Types.ObjectId(modifier.restaurantId) as any)
        : "",
    menuId:
      typeof modifier?.menuId === "string"
        ? (new Types.ObjectId(modifier.menuId) as any)
        : "",
    name:
      typeof modifier.name === "string" ? modifier.name : "Unnamed Modifier",
    required:
      typeof modifier.required === "boolean" ? modifier.required : false,
    multiple:
      typeof modifier.multiple === "boolean" ? modifier.multiple : false,
    max: modifier.max && modifier.max > 0 ? modifier.max : undefined,
    indexDaysAvailable: Array.isArray(modifier.indexDaysAvailable)
      ? modifier.indexDaysAvailable.filter((day) => day >= 0 && day <= 6)
      : [],
    options: Array.isArray(modifier.options)
      ? modifier.options.map(sanitizeAddition) // sanitize each option
      : [],
  };
};
