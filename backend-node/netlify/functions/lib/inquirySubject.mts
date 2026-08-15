/**
 * app/models/inquiry.py's InquirySubject is a (str, Enum) whose Python *name*
 * (stored in the DB's inquiry_subject enum type) differs from its *value*
 * (what the API sends/receives, and what the frontend displays). SQLAlchemy
 * translates name<->value transparently; here that translation is explicit.
 */
export const SUBJECT_VALUE_TO_DB: Record<string, string> = {
  "Commander un modèle": "order",
  "Question sur un produit": "product_question",
  "Suivi de commande": "order_tracking",
  "Retour ou échange": "return_exchange",
  Autre: "other",
};

export const SUBJECT_DB_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_VALUE_TO_DB).map(([value, dbName]) => [dbName, value])
);

export const INQUIRY_SUBJECT_VALUES = Object.keys(SUBJECT_VALUE_TO_DB);
