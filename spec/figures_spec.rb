RSpec.describe Figures do
  subject(:output) { described_class.transform(content, source) }

  let(:source) { Dir.mktmpdir }

  after { FileUtils.remove_entry(source) }

  def asset(name, width:, height:)
    path = File.join(source, "assets", name)
    FileUtils.mkdir_p(File.dirname(path))
    File.binwrite(path, Png.bytes(width, height))
    "/assets/#{name}"
  end

  describe "a standalone image" do
    let(:content) { %(<p><img src="#{asset("photo.png", width: 800, height: 600)}" alt="A photo" /></p>) }

    it "becomes a figure" do
      expect(output).to eq(<<~HTML.chomp)
        <figure>
          <img src="/assets/photo.png" alt="A photo" width="800" height="600" loading="lazy" decoding="async">
        </figure>
      HTML
    end
  end

  describe "dimensions" do
    context "when the file is a local asset" do
      let(:content) { %(<p><img src="#{asset("wide.png", width: 1600, height: 400)}" alt="" /></p>) }

      it "reads them from disk" do
        expect(output).to include(%(width="1600" height="400"))
      end
    end

    context "when the source is remote" do
      let(:content) { %(<p><img src="https://example.com/photo.png" alt="" /></p>) }

      it "omits them rather than fetching over the network" do
        expect(output).to include("<figure>")
        expect(output).not_to include("width=")
      end
    end

    context "when the file is missing" do
      let(:content) { %(<p><img src="/assets/gone.png" alt="" /></p>) }

      it "omits them" do
        expect(output).to include("<figure>")
        expect(output).not_to include("width=")
      end
    end

    context "when the path is relative" do
      let(:content) { %(<p><img src="nested/photo.png" alt="" /></p>) }

      it "omits them" do
        expect(output).to include("<figure>")
        expect(output).not_to include("width=")
      end
    end
  end

  describe "alt text" do
    context "when empty" do
      let(:content) { %(<p><img src="/assets/gone.png" alt="" /></p>) }

      it "is preserved, marking the image decorative" do
        expect(output).to include(%(alt=""))
      end
    end

    context "when absent" do
      let(:content) { %(<p><img src="/assets/gone.png" /></p>) }

      it "stays absent" do
        expect(output).not_to include("alt=")
      end
    end
  end

  describe "a link-wrapped image" do
    let(:content) do
      %(<p><a href="https://example.com"><img src="#{asset("photo.png", width: 10, height: 20)}" alt="" /></a></p>)
    end

    it "keeps the link inside the figure" do
      expect(output).to eq(<<~HTML.chomp)
        <figure>
          <a href="https://example.com"><img src="/assets/photo.png" alt="" width="10" height="20" loading="lazy" decoding="async"></a>
        </figure>
      HTML
    end
  end

  describe "a markdown title" do
    let(:content) { %(<p><img src="/assets/gone.png" alt="" title="Not a caption" /></p>) }

    it "is dropped, since captions are not supported" do
      expect(output).not_to include("figcaption")
      expect(output).not_to include("title=")
    end
  end

  describe "images left alone" do
    [
      ["sharing a paragraph with text", %(<p>Before <img src="/a.png" alt="" /> after.</p>)],
      ["sharing a paragraph with each other", %(<p><img src="/a.png" alt="" /> <img src="/b.png" alt="" /></p>)],
      ["inside an unclosed link", %(<p><a href="/x"><img src="/a.png" alt="" /></p>)],
      ["closing a link it never opened", %(<p><img src="/a.png" alt="" /></a></p>)],
      ["already inside a figure", %(<figure><img src="/a.png" alt="" /></figure>)],
    ].each do |description, markup|
      context "an image #{description}" do
        let(:content) { markup }

        it "is untouched" do
          expect(output).to eq(markup)
        end
      end
    end
  end

  describe "a document with prose around several images" do
    let(:content) do
      <<~HTML.chomp
        <p>First.</p>

        <p><img src="/assets/gone.png" alt="One" /></p>

        <p>Second.</p>

        <p><img src="/assets/gone.png" alt="Two" /></p>
      HTML
    end

    it "converts every standalone image and leaves the prose alone" do
      expect(output.scan("<figure>").count).to eq(2)
      expect(output).to include("<p>First.</p>").and include("<p>Second.</p>")
    end
  end

  describe "content with no images" do
    let(:content) { "<p>Nothing to see here.</p>" }

    it "is returned unchanged" do
      expect(output).to eq(content)
    end
  end
end
