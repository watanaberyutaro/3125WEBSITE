/** 任意のJSON-LDオブジェクトを<script type="application/ld+json">として出力する薄いラッパー */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
