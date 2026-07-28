require "fastimage"

# Rewrites standalone images into <figure> elements, hey.world style.
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
    width, height = dimensions(src, source)

    image_attributes = {
      "src" => src,
      "alt" => attribute(attributes, "alt"),
      "width" => width,
      "height" => height,
      "loading" => "lazy",
      "decoding" => "async"
    }
      .compact
      .map { |name, value| %(#{name}="#{value}") }
      .join(" ")

    image = %(<img #{image_attributes}>)
    image = %(#{link_open}#{image}</a>) if link_open

    %(<figure>\n  #{image}\n</figure>)
  end

  def self.attribute(attributes, name)
    attributes[/\s#{name}="([^"]*)"/m, 1]
  end

  def self.dimensions(src, source)
    return unless src&.start_with?("/")

    path = File.join(source, src)
    FastImage.size(path) if File.file?(path)
  end
end

Jekyll::Hooks.register [:documents, :pages], :post_convert do |doc|
  doc.content = Figures.transform(doc.content, doc.site.source)
end
