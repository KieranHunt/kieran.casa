require "nokogiri"

RSpec.describe "analytics" do
  before(:all) do
    @site_dir = Dir.mktmpdir
    previous_env = ENV["JEKYLL_ENV"]
    begin
      # Mirror Netlify's production build: if analytics is ever wrapped in a
      # jekyll.environment conditional, a dev-env build would green-light it.
      ENV["JEKYLL_ENV"] = "production"
      Jekyll::Commands::Build.process(
        Jekyll.configuration(
          "source" => File.expand_path("..", __dir__),
          "destination" => @site_dir,
          "quiet" => true,
        ),
      )
    ensure
      ENV["JEKYLL_ENV"] = previous_env
    end
  end

  after(:all) do
    FileUtils.remove_entry(@site_dir)
  end

  it "includes sentry and goatcounter in the head of every page" do
    failures = Dir.glob(File.join(@site_dir, "**", "*.html")).filter_map do |file|
      head = Nokogiri::HTML(File.read(file)).at("head")
      missing = []
      missing << "sentry" unless head&.at('script[src*="sentry-cdn"]')
      missing << "goatcounter" unless head&.at("script[data-goatcounter]")
      "#{file.sub("#{@site_dir}/", "")} missing: #{missing.join(", ")}" unless missing.empty?
    end

    expect(failures).to be_empty, -> { "Pages missing analytics:\n  #{failures.join("\n  ")}" }
  end
end
