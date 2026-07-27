require "jekyll"
require "tmpdir"
require "fileutils"

require_relative "support/png"
require_relative "../_plugins/figures"

RSpec.configure do |config|
  config.disable_monkey_patching!
  config.expect_with(:rspec) { |expectations| expectations.syntax = :expect }
end
