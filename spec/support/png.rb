require "zlib"

# Builds a valid PNG of a given size, so specs can exercise dimension reading
# without committing binary fixtures.
module Png
  def self.bytes(width, height)
    header = [width, height, 8, 2, 0, 0, 0].pack("NNC5")
    scanline = ("\x00" * (1 + (width * 3))).b

    "\x89PNG\r\n\x1a\n".b +
      chunk("IHDR", header) +
      chunk("IDAT", Zlib::Deflate.deflate(scanline * height)) +
      chunk("IEND", "".b)
  end

  def self.chunk(type, data)
    [data.bytesize].pack("N") + type.b + data + [Zlib.crc32(type.b + data)].pack("N")
  end
end
