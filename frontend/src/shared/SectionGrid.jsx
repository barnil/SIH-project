export default function SectionGrid({ title, items }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const wrapperClass = item.className ? item.className : 'card'
          const titleClass = item.titleClass ? item.titleClass : 'font-semibold'
          const descClass = item.descClass ? item.descClass : 'text-gray-600 text-sm mt-1'
          return (
            <article key={idx} className={wrapperClass}>
              <h4 className={titleClass}>{item.title}</h4>
              {item.desc && <p className={descClass}>{item.desc}</p>}
              {item.extra}
            </article>
          )
        })}
      </div>
    </section>
  )
}
