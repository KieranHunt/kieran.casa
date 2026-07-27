require "fastimage"

# Rewrites standalone images into <figure> elements, hey.world style:
# the image's markdown title becomes the caption.
#
#   ![alt text](/assets/photo.webp "Caption text")
#
# Images sharing a paragraph with other content are left alone, so inline
# images keep working.
module Figures
  BLOCK_IMAGE = %r{
    <p>\s*
      (?<link_open><a\b[^>]*>)?\s*
      <img\b(?<attributes>[^>]*?)\s*/?>\s*
      (?<link_close></a>)?\s*
    </p>
  }mx

  def self.transform(content, source)
    content.gsub(BLOCK_IMAGE) do
      match = Regexp.last_match
      next match[0] if match[:link_open].nil? != match[:link_close].nil?

      figure(match[:attributes], match[:link_open], source)
    end
  end

  def self.figure(attributes, link_open, source)
    src = attribute(attributes, "src")
    alt = attribute(attributes, "alt")
    caption = attribute(attributes, "title")

    image = +%(<img src="#{src}")
    image << %( alt="#{alt}") if alt
    width, height = dimensions(src, source)
    image << %( width="#{width}" height="#{height}") if width
    image << %( loading="lazy" decoding="async">)
    image = %(#{link_open}#{image}</a>) if link_open

    figcaption = %(\n  <figcaption>#{caption}</figcaption>) unless caption.to_s.empty?

    %(<figure>\n  #{image}#{figcaption}\n</figure>)
  end

  def self.attribute(attributes, name)
    attributes[/\s#{name}="([^"]*)"/m, 1]
  end

  def self.dimensions(src, source)
    return unless src&.start_with?("/")

    @dimensions ||= {}
    return @dimensions[src] if @dimensions.key?(src)

    path = File.join(source, src)
    @dimensions[src] = FastImage.size(path) if File.file?(path)
  end
end

Jekyll::Hooks.register [:documents, :pages], :post_convert do |doc|
  doc.content = Figures.transform(doc.content, doc.site.source)
end
