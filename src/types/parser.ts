export interface ExcelSheet {
  numero_feuille: number;
  nom_feuille: string;
  lignes: any[][];
}

export interface ExcelData {
  fichier: string;
  nombre_feuilles: number;
  donnees: ExcelSheet[];
}

export interface PDFImage {
  page: number;
  image_file: string;
  width: number;
  height: number;
}

export interface PDFTable {
  page: number;
  table_file: string;
  rows: number;
  columns: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
}

export interface PDFData {
  message: string;
  metadata: PDFMetadata;
  nb_pages: number;
  texte_extrait_longueur: number;
  nb_images: number;
  nb_tableaux: number;
  images: PDFImage[];
  tableaux: PDFTable[];
  extrait_texte: string;
}

export interface UploadResult {
  excel_files: Array<{
    file_name: string;
    data: ExcelData;
  }>;
  pdf_files: Array<{
    file_name: string;
    data: PDFData;
  }>;
  other_files: Array<{
    file_name: string;
    data: any;
  }>;
  errors: Array<{
    file_name: string;
    error: string;
  }>;
}
